import type { Request, Response, NextFunction } from 'express';
import { getBucket } from './../config/firebse.js';
import { Photo } from '../model/photoModel.js';

const uploadToFirebase = async (file: Express.Multer.File): Promise<{ url: string; publicId: string }> => {
    const bucket = getBucket();
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `photovault/${timestamp}-${sanitizedName}`;
    
    const blob = bucket.file(filename);
    
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
        resumable: false
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error: any) => {
            console.error('❌ Firebase upload error:', error);
            reject(error);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                
                console.log('✅ Firebase upload success!');
                resolve({
                    url: publicUrl,
                    publicId: blob.name
                });
            } catch (error) {
                console.error('❌ Error making file public:', error);
                reject(error);
            }
        });

        blobStream.end(file.buffer);
    });
};

export const uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('🎯 UPLOAD CONTROLLER HIT');
    console.log('👤 User:', req.user?.username);
    console.log('📦 Body:', req.body);
    
    try {
        if (!req.file) {
            console.log('❌ No file uploaded');
            res.status(400).json({
                status: 'fail',
                message: 'No file uploaded'
            });
            return;
        }

        console.log('✅ File received:', req.file.size, 'bytes');

        const { title, description, visibility = 'private', albumId } = req.body;

        if (!title) {
            console.log('❌ No title provided');
            res.status(400).json({
                status: 'fail',
                message: 'Photo title is required'
            });
            return;
        }

        console.log('☁️ Uploading to Firebase...');
        
        const { url, publicId } = await uploadToFirebase(req.file);

        console.log('💾 Saving to database...');
        const photo = await Photo.create({
            title,
            description,
            url,
            publicId,
            visibility,
            owner: req.user!._id,
            album: albumId || undefined
        });

        console.log('✅ Photo saved! ID:', photo._id);

        res.status(201).json({
            status: 'success',
            data: { photo }
        });

    } catch (error) {
        console.error('❌ ERROR:', error);
        next(error);
    }
};

export const uploadMultiplePhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({
                status: 'fail',
                message: 'No files uploaded'
            });
            return;
        }

        const { titles, descriptions, visibility = 'private', albumId } = req.body;
        
        const titleArray = typeof titles === 'string' ? JSON.parse(titles) : titles;
        const descArray = typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;

        console.log(`☁️ Uploading ${req.files.length} files...`);

        const uploadedPhotos = await Promise.all(
            req.files.map(async (file: Express.Multer.File, index: number) => {
                const { url, publicId } = await uploadToFirebase(file);

                return await Photo.create({
                    title: titleArray?.[index] || `Photo ${index + 1}`,
                    description: descArray?.[index] || '',
                    url,
                    publicId,
                    visibility,
                    owner: req.user!._id,
                    album: albumId || undefined
                });
            })
        );

        console.log(`✅ ${uploadedPhotos.length} photos saved!`);

        res.status(201).json({
            status: 'success',
            results: uploadedPhotos.length,
            data: { photos: uploadedPhotos }
        });

    } catch (error) {
        console.error('❌ ERROR:', error);
        next(error);
    }
};

export const deletePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            res.status(400).json({
                status: 'fail',
                message: 'Public ID is required'
            });
            return;
        }

        const photo = await Photo.findOne({ publicId });

        if (!photo) {
            res.status(404).json({
                status: 'fail',
                message: 'Photo not found'
            });
            return;
        }

        const isOwner = photo.owner.toString() === req.user!._id.toString();
        const isAdmin = req.user!.role === 'admin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to delete this photo'
            });
            return;
        }

        console.log('🗑️ Deleting from Firebase...');
        
        const bucket = getBucket();
        try {
            await bucket.file(publicId).delete();
            console.log('✅ Deleted from Firebase');
        } catch (error) {
            console.error('⚠️ Firebase deletion warning:', error);
        }

        await Photo.findByIdAndDelete(photo._id);

        console.log('✅ Photo deleted!');

        res.status(200).json({
            status: 'success',
            message: 'Photo deleted successfully'
        });

    } catch (error) {
        console.error('❌ ERROR:', error);
        next(error);
    }
};