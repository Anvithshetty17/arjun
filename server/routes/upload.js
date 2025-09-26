const express = require('express');
const { auth } = require('../middleware/auth');
const { uploadProfile, uploadResume, cloudinary } = require('../config/cloudinary');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/upload/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', auth, uploadProfile.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update user's profile picture URL
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`campus-connect/profiles/${publicId}`);
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: req.file.path
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/upload/resume
// @desc    Upload resume (Students only)
// @access  Private
router.post('/resume', auth, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can upload resumes' });
    }

    // Delete old resume if exists
    if (user.resume) {
      const publicId = user.resume.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`campus-connect/resumes/${publicId}`, { resource_type: 'raw' });
    }

    user.resume = req.file.path;
    await user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: req.file.path
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/upload/profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete from Cloudinary
    const publicId = user.profilePicture.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`campus-connect/profiles/${publicId}`);

    // Remove from user record
    user.profilePicture = '';
    await user.save();

    res.json({ message: 'Profile picture deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/upload/resume
// @desc    Delete resume
// @access  Private
router.delete('/resume', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can delete resumes' });
    }

    if (!user.resume) {
      return res.status(400).json({ message: 'No resume to delete' });
    }

    // Delete from Cloudinary
    const publicId = user.resume.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`campus-connect/resumes/${publicId}`, { resource_type: 'raw' });

    // Remove from user record
    user.resume = '';
    await user.save();

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;