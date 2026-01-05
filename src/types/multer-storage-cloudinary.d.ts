declare module 'multer-storage-cloudinary' {
    import { StorageEngine } from 'multer';
    import { v2 as cloudinary } from 'cloudinary';

    interface CloudinaryStorageOptions {
        cloudinary: typeof cloudinary;
        params: (req: any, file: Express.Multer.File) => Promise<{
            folder: string;
            allowed_formats?: string[];
            transformation?: any[];
            public_id?: string;
        }>;
    }

    class CloudinaryStorage implements StorageEngine {
        constructor(options: CloudinaryStorageOptions);
        _handleFile(req: any, file: any, callback: (error?: any, info?: any) => void): void;
        _removeFile(req: any, file: any, callback: (error: Error) => void): void;
    }

    export = CloudinaryStorage;  
}