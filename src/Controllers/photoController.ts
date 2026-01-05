import type { Request, Response, NextFunction } from 'express';
import { Photo } from '../model/photoModel.js';
import cloudinary from '../config/firebse.js';

// Get all public photos
export const getPublicPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const photos = await Photo.find({ visibility: 'public' })
            .populate('owner', 'username email')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: photos.length,
            data: { photos }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user's photos
export const getMyPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const photos = await Photo.find({ owner: req.user!._id })
            .populate('album', 'name')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: photos.length,
            data: { photos }
        });
    } catch (error) {
        next(error);
    }
};

// Get single photo
export const getPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const photo = await Photo.findById(req.params.id)
            .populate('owner', 'username email')
            .populate('album', 'name');

        if (!photo) {
            res.status(404).json({
                status: 'fail',
                message: 'Photo not found'
            });
            return;
        }

        // Check if user can view this photo
        const isOwner = photo.owner._id.toString() === req.user!._id.toString();
        const isPublic = photo.visibility === 'public';
        const isAdmin = req.user!.role === 'admin';

        if (!isPublic && !isOwner && !isAdmin) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to view this photo'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { photo }
        });
    } catch (error) {
        next(error);
    }
};

// Update photo metadata
export const updatePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, description, visibility } = req.body;

        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            res.status(404).json({
                status: 'fail',
                message: 'Photo not found'
            });
            return;
        }

        // Check ownership
        if (photo.owner.toString() !== req.user!._id.toString()) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to update this photo'
            });
            return;
        }

        if (title) photo.title = title;
        if (description !== undefined) photo.description = description;
        if (visibility) photo.visibility = visibility;

        await photo.save();

        res.status(200).json({
            status: 'success',
            data: { photo }
        });
    } catch (error) {
        next(error);
    }
};

// Delete photo (moved from uploadController for consistency)
export const deletePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            res.status(404).json({
                status: 'fail',
                message: 'Photo not found'
            });
            return;
        }

        // Check authorization: owner or admin
        const isOwner = photo.owner.toString() === req.user!._id.toString();
        const isAdmin = req.user!.role === 'admin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to delete this photo'
            });
            return;
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(photo.publicId);

        // Delete from database
        await Photo.findByIdAndDelete(photo._id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};