import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset. Click the link below:</p>
            <a href = "${resetUrl}">${resetUrl}</a>
            <p>This link expires in  1 hour</p>
            <p>If you didin't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);

};