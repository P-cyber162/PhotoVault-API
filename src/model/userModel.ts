import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string | undefined;
    resetPasswordExpires?: Date | undefined;
};

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'A username must be provided!']
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'An email must be provided!'],
        validate: {
            validator: function(value: string) {
                return validator.isEmail(value);
            },
            message: 'Invalid email!'
        }
    },
    password: {
        type: String,
        select: false,
        required: [true, 'A password must be provided!']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {timestamps: true});

userSchema.pre('save', async function() {
    if(! this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
    
})

export const User = mongoose.model<IUser>('User', userSchema);