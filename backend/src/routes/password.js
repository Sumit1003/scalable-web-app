const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/password/forgot
// @desc    Forgot password - verify email and date of birth
// @access  Public
router.post('/forgot', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('dateOfBirth').isDate().withMessage('Please enter a valid date of birth')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, dateOfBirth } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        // Verify date of birth
        const userDOB = new Date(user.dateOfBirth).toISOString().split('T')[0];
        const providedDOB = new Date(dateOfBirth).toISOString().split('T')[0];

        if (userDOB !== providedDOB) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth does not match our records'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // In a real application, you would send an email here
        // For this demo, we'll return the token directly
        // In production, NEVER return the token in response

        res.json({
            success: true,
            message: 'Password reset token generated successfully',
            data: {
                resetToken, // Remove this in production - send via email instead
                message: 'In production, this token would be sent to your email'
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing forgot password request'
        });
    }
});

// @route   PUT /api/password/reset
// @desc    Reset password with token
// @access  Public
router.put('/reset', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token, password } = req.body;

        // Hash token to compare with stored hash
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user by reset token and check expiration
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
});

// @route   POST /api/password/verify-dob
// @desc    Verify date of birth for a user (useful for frontend verification)
// @access  Public
router.post('/verify-dob', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('dateOfBirth').isDate().withMessage('Please enter a valid date of birth')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, dateOfBirth } = req.body;

        const user = await User.findOne({ email }).select('dateOfBirth');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        const userDOB = new Date(user.dateOfBirth).toISOString().split('T')[0];
        const providedDOB = new Date(dateOfBirth).toISOString().split('T')[0];

        const isMatch = userDOB === providedDOB;

        res.json({
            success: true,
            data: {
                isMatch,
                message: isMatch ? 'Date of birth verified successfully' : 'Date of birth does not match'
            }
        });

    } catch (error) {
        console.error('Verify DOB error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying date of birth'
        });
    }
});

module.exports = router;