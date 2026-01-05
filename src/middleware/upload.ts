import multer from 'multer';

console.log('⚙️ Initializing upload middleware...');

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('🔍 File filter checking:', file.mimetype, file.originalname);
    if (file.mimetype.startsWith('image/')) {
        console.log('✅ File type accepted');
        cb(null, true);
    } else {
        console.log('❌ File type rejected');
        cb(new Error('Only image files are allowed!'));
    }
};

const multerUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

console.log('✅ Multer configured');

export const uploadSingle = (req: any, res: any, next: any) => {
    console.log('📤 uploadSingle middleware started');
    
    const uploadHandler = multerUpload.single('photo');
    
    uploadHandler(req, res, (err: any) => {
        if (err) {
            console.error('❌ Multer error:', err.message);
            return res.status(400).json({
                status: 'fail',
                message: err.message
            });
        }
        
        console.log('✅ Multer finished');
        console.log('File present?', !!req.file);
        if (req.file) {
            console.log('📸 File size:', req.file.size, 'bytes');
        }
        
        next();
    });
};

export const uploadMultiple = multerUpload.array('photos', 10);

export const uploadFields = multerUpload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]);