import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import { User } from './../model/userModel.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';

// CREATE TOKEN
const signToken = (id: String): string => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET as string, 
        { expiresIn:  '7d' }
    )
};

// REGISTER USER
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try{
        const { username, email, password } = req.body;
    
        const newUser = await User.create({
            username,
            email,
            password
        });
    
        const token = signToken(newUser._id.toString());
    
        res.status(201).json({
            status: 'success',
            token,
            data: {
                newUser
            }
        })

    }catch(error){
        res.status(400).json({
            status: 'fail',
            message: error instanceof Error ? error.message : 'An error occurred'
        })
    }
};

// LOGIN USER
export const  login = async(req: Request, res: Response) => {
    try{
        const {email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide your email and password'
            })
        };

        const user = await User.findOne({email}).select("+password");

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            })
        };

        const token = signToken(user._id.toString());

        res.status(200).json({
            status: 'success',
            token
        })

    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: error instanceof Error ? error.message : 'Server Error'
        })
    }
};

// PROTECT ROUTES
export const protect = async(req: Request, res: Response, next: NextFunction) => {
    try{
        //GET TOKEN
        let token;
        if(
            req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // CHECK IF TOKEN EXISTS
        if(!token){
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to gain access'
            })
        };

        // DERIEVE DETAILS FROM TOKEN
        const secret = process.env.JWT_SECRET;
        if(!secret) {
            res.status(500).json({
            status: 'error',
            message: 'Server configuration error'
        })
        return;
        }

        const decoded = jwt.verify(token, secret) as { id:string };

        // FIND USER WITH DECODED ID
        const freshUser = await User.findById(decoded.id);

        if(!freshUser){
            return res.status(401).json({
                status: 'fail',
                message: 'User belonging to this token does not exist'
            })
        };
        // EQUATE FOUND USER TO REQUESTED USER
        req.user = freshUser;
        next();

    }catch(err){
        res.status(401).json({
            status: 'fail',
            message: 'Invalid or expired token!'
        })
    }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
    try{
        const { email } = req.body;

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(200).json({
                status: 'success',
                message: 'If that email exist, we sent a reset link!'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto 
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to email'
        });

    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: error instanceof Error ? error.message : 'Server Error'
        })
    };
};


// RESET PASSWORD
export const resetPassword = async(req: Request, res:Response) => {
    try{
        const { token } = req.params;
        const { newPassword } = req.body;

        if(!token) {
            return res.status(400).json({
                status: 'fail',
                message: 'Reset token is required'
            })
        }

        if(!newPassword || newPassword.length< 8) {
            return res.status(400).json({
                status: 'fail',
                message: 'Password must be at least 8 characters'
            });
        }

        const hashedToken = crypto 
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gte: Date.now() }
        });

        if(!user) {
            return res.status(400).json({
                error: 'Invalid or expired reset token'
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful'
        });

    }catch(error){
        res.status(500).json({
            status: 'fail',
            message: error instanceof Error ? error.message : 'Server Error'
        })
    }
};

// RBAC RESTRICTION TO SPECIFIC ROLES
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

// GOOGLE OAUTH
export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'OAuth failed' 
      });
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  })(req, res, next);
};

