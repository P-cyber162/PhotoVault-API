import type { NextFunction, Request, Response, } from 'express';
import { User } from './../model/userModel.js';

// GET ALL USERS - ADMIN ONLY
export const getAllUser = async (req: Request, res: Response, next: NextFunction): Promise <void> => {
    try{
        const users = await User.find();

        if(!users || users.length === 0){
            res.status(404).json({
            status: 'fail',
            message: 'No users currently available'
        });
        return;
        }

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        })

    }catch(err){
        next(err);
    }
}

// GET A SINGLE USER BY USERNAME - ADMIN ONLY
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise <void> => {
    try{
        const { username } = req.params;
        if(!username){
            res.status(404).json({
            status: 'fail',
            message: 'Username is required!'
        })
        return;
        }

        const user = await User.findOne({ 
            username: username 
        });

        if(!user){
            res.status(404).json({
            status: 'fail',
            message: 'User Not Found'
        });
        return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })

    }catch(err){
        next(err);
    }
};

// DELETE A SINGLE USER BY USERNAME 
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise <void> => {
    try{
        const { username } = req.params;
        if(!username){
            res.status(404).json({
            status: 'fail',
            message: 'Username is required!'
        })
        return;
        } 

        const user = await User.findOneAndDelete({
            username: username,
        });

        if(!user){
            res.status(404).json({
            status: 'fail',
            message: 'User Not Found'
        });
        return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })

    }catch(err){
        next(err);
    }
};
