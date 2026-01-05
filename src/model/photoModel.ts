import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto extends Document {
    title: string;
    description?: string;
    url: string;
    publicId: string;
    visibility: 'public' | 'private';
    owner: mongoose.Types.ObjectId;
    album?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>({
    title: {
        type: String,
        required: [true, 'A photo must have a title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: [true, 'Photo URL is required']
    },
    publicId: {
        type: String,
        required: [true, 'Cloudinary public ID is required'],
        unique: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Photo must belong to a user']
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album'
    }
}, { timestamps: true });

// Index for faster queries
photoSchema.index({ owner: 1, visibility: 1 });
photoSchema.index({ album: 1 });

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);