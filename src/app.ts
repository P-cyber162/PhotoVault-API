import express, { type Request, type Response, type NextFunction } from 'express';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import authRoutes from './route/authRoute.js';
import userRoutes from './route/userRoutes.js';
import uploadRoutes from './route/uploadRoute.js';

const app = express();

app.use(express.json());  
app.use(express.urlencoded({ extended: true })); 

if(process.env.NODE_ENV === 'development'){ 
  app.use(morgan('dev'));
}

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());


// GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

export default app;