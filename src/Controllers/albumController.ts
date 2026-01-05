import type { Request, Response, NextFunction } from 'express';
import { Album } from '../model/albumModel.js';
import { Photo } from '../model/photoModel.js';

// Create album
export const createAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({
                status: 'fail',
                message: 'Album name is required'
            });
            return;
        }

        const album = await Album.create({
            name,
            description,
            owner: req.user!._id
        });

        res.status(201).json({
            status: 'success',
            data: { album }
        });
    } catch (error) {
        next(error);
    }
};

// Get all albums for current user
export const getMyAlbums = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const albums = await Album.find({ owner: req.user!._id })
            .populate('photos')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: albums.length,
            data: { albums }
        });
    } catch (error) {
        next(error);
    }
};

// Get single album
export const getAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const album = await Album.findById(req.params.id).populate('photos');

        if (!album) {
            res.status(404).json({
                status: 'fail',
                message: 'Album not found'
            });
            return;
        }

        // Check if user owns the album
        if (album.owner.toString() !== req.user!._id.toString()) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to view this album'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { album }
        });
    } catch (error) {
        next(error);
    }
};

// Update album
export const updateAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;

        const album = await Album.findById(req.params.id);

        if (!album) {
            res.status(404).json({
                status: 'fail',
                message: 'Album not found'
            });
            return;
        }

        if (album.owner.toString() !== req.user!._id.toString()) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to update this album'
            });
            return;
        }

        if (name) album.name = name;
        if (description !== undefined) album.description = description;

        await album.save();

        res.status(200).json({
            status: 'success',
            data: { album }
        });
    } catch (error) {
        next(error);
    }
};

// Delete album
export const deleteAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const album = await Album.findById(req.params.id);

        if (!album) {
            res.status(404).json({
                status: 'fail',
                message: 'Album not found'
            });
            return;
        }

        if (album.owner.toString() !== req.user!._id.toString()) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to delete this album'
            });
            return;
        }

        await Album.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Add photo to album
export const addPhotoToAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { photoId } = req.body;
        const { id: albumId } = req.params;

        const album = await Album.findById(albumId);
        const photo = await Photo.findById(photoId);

        if (!album || !photo) {
            res.status(404).json({
                status: 'fail',
                message: 'Album or photo not found'
            });
            return;
        }

        // Check ownership
        if (album.owner.toString() !== req.user!._id.toString() ||
            photo.owner.toString() !== req.user!._id.toString()) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission'
            });
            return;
        }

        // Add photo to album if not already there
        if (!album.photos.includes(photo._id)) {
            album.photos.push(photo._id);
            await album.save();
        }

        // Update photo's album reference
        photo.album = album._id;
        await photo.save();

        res.status(200).json({
            status: 'success',
            data: { album }
        });
    } catch (error) {
        next(error);
    }
};