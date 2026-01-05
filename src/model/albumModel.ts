import mongoose, { Document, Schema } from 'mongoose';

export interface IAlbum extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    photos: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const albumSchema = new Schema<IAlbum>({
    name: {
        type: String,
        required: [true, 'Album must have a name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Album must belong to a user']
    },
    photos: [{
        type: Schema.Types.ObjectId,
        ref: 'Photo'
    }]
}, { timestamps: true });

albumSchema.index({ owner: 1 });

export const Album = mongoose.model<IAlbum>('Album', albumSchema);