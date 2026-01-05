import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { createApiLimiter } from './middleware/rateLimitter.js';
import authRoutes from './route/authRoute.js';
import userRoutes from './route/userRoutes.js';
import uploadRoutes from './route/uploadRoute.js';
import photoRoutes from './route/photoRoutes.js';
import albumRoutes from './route/albumRoutes.js';

const startServer = async() => {
    try{
        // CONNECT TO DATABASE
        await connectDB();

        // CONNECT TO REDIS DATABASE
        await connectRedis();
        
        const apiLimiter = createApiLimiter();
        
        // APPLY RATE LIMITTER
        app.use('/api', apiLimiter);
        
        // REGISTER ROUTES
        app.use('/api/v1/auth', authRoutes);
        app.use('/api/v1/users', userRoutes);
        app.use('/api/v1/upload', uploadRoutes);
        app.use('/api/v1/photos', photoRoutes);
        app.use('/api/v1/albums', albumRoutes);
        
        const port = process.env.PORT || 3000;
        app.listen(port, ()=>{ 
            console.log(`Server is running on port ${port}`);
        });
    }catch(err){
        console.log('Error: ', err instanceof Error ? err.message : err);
    }
}

startServer();