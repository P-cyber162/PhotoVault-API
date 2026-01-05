import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = path.resolve(__dirname, '../../firebase-service-account.json');

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!storageBucket) {
    throw new Error('FIREBASE_STORAGE_BUCKET is required in .env file');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket
});

console.log('✅ Firebase Storage initialized');

export const getBucket = (): any => admin.storage().bucket();

export default admin;