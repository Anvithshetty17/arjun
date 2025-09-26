const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Batch = require('../models/Batch');
const { auth, studentAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students/profile
// @desc    Get current student profile
// @access  Student only
router.get('/profile', studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('-password')
      .populate('batch');
    
    res.json(student);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/profile
// @desc    Update student profile (only alumni can update work-related fields)
// @access  Student only
router.put('/profile', studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('batch');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const {
      phone,
      jobRole,
      company,
      workLocation,
      salary,
      experience,
      skills,
      achievements,
      linkedinProfile,
      githubProfile,
      portfolioWebsite,
      currentStatus
    } = req.body;

    // Only allow basic profile updates for non-alumni
    if (!student.isAlumni) {
      // Non-alumni can only update limited fields
      if (phone) student.phone = phone;
      if (linkedinProfile) student.linkedinProfile = linkedinProfile;
      if (githubProfile) student.githubProfile = githubProfile;
      if (portfolioWebsite) student.portfolioWebsite = portfolioWebsite;
      if (skills) student.skills = skills;
    } else {
      // Alumni can update all work-related fields
      if (phone) student.phone = phone;
      if (jobRole) student.jobRole = jobRole;
      if (company) student.company = company;
      if (workLocation) student.workLocation = workLocation;
      if (salary) student.salary = salary;
      if (experience) student.experience = experience;
      if (skills) student.skills = skills;
      if (achievements) student.achievements = achievements;
      if (linkedinProfile) student.linkedinProfile = linkedinProfile;
      if (githubProfile) student.githubProfile = githubProfile;
      if (portfolioWebsite) student.portfolioWebsite = portfolioWebsite;
      if (currentStatus) student.currentStatus = currentStatus;
    }

    await student.save();

    const updatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('batch');

    res.json(updatedStudent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/alumni
// @desc    Get all alumni with filtering and sorting
// @access  Student only
router.get('/alumni', studentAuth, async (req, res) => {
  try {
    const { batch, company, course, department, search, sortBy, sortOrder } = req.query;
    
    let query = { role: 'student', isAlumni: true };
    
    // Apply filters
    if (batch) query.batch = batch;
    if (company) query.company = new RegExp(company, 'i');
    if (course) query.course = new RegExp(course, 'i');
    if (department) query.department = new RegExp(department, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { jobRole: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Set up sorting
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions = { name: 1 };
    }

    const alumni = await User.find(query)
      .select('-password -email') // Hide sensitive info
      .populate('batch', 'batchName year course department')
      .sort(sortOptions);

    res.json(alumni);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/alumni/:id
// @desc    Get specific alumni details
// @access  Student only
router.get('/alumni/:id', studentAuth, async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id)
      .select('-password -email') // Hide sensitive info
      .populate('batch', 'batchName year course department');
    
    if (!alumni || !alumni.isAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(alumni);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/batches
// @desc    Get all batches for filtering
// @access  Student only
router.get('/batches', studentAuth, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ year: -1, batchName: 1 });
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/companies
// @desc    Get unique companies from alumni for filtering
// @access  Student only
router.get('/companies', studentAuth, async (req, res) => {
  try {
    const companies = await User.distinct('company', { 
      role: 'student', 
      isAlumni: true, 
      company: { $ne: '', $exists: true } 
    });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/stats
// @desc    Get student dashboard statistics
// @access  Student only
router.get('/stats', studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('batch');
    
    const batchMates = await User.countDocuments({ 
      batch: student.batch._id,
      role: 'student',
      _id: { $ne: student._id }
    });

    const batchAlumni = await User.countDocuments({
      batch: student.batch._id,
      role: 'student',
      isAlumni: true
    });

    const totalAlumni = await User.countDocuments({
      role: 'student',
      isAlumni: true
    });

    // Get top companies among alumni
    const topCompanies = await User.aggregate([
      { $match: { role: 'student', isAlumni: true, company: { $ne: '', $exists: true } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      isAlumni: student.isAlumni,
      batchMates,
      batchAlumni,
      totalAlumni,
      topCompanies: topCompanies.map(tc => ({ company: tc._id, count: tc.count }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/my-batch
// @desc    Get current student's batch mates
// @access  Student only
router.get('/my-batch', studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    const batchMates = await User.find({
      batch: student.batch,
      role: 'student',
      _id: { $ne: student._id }
    })
    .select('-password -email')
    .populate('batch', 'batchName year course department')
    .sort({ name: 1 });

    res.json(batchMates);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/connections
// @desc    Get user's connections
// @access  Student only
router.get('/connections', studentAuth, async (req, res) => {
  try {
    const { search, course, batch, status } = req.query;
    const student = await User.findById(req.user.id);
    
    // Mock connection data - in a real app, you'd have a connections collection
    let query = { 
      role: 'student', 
      _id: { $ne: student._id },
      batch: { $ne: null }
    };
    
    // Apply filters
    if (course) query.course = new RegExp(course, 'i');
    if (batch) query.batch = batch;
    if (status === 'alumni') query.isAlumni = true;
    if (status === 'student') query.isAlumni = false;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { jobRole: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const connections = await User.find(query)
      .select('-password -email')
      .populate('batch', 'batchName year course')
      .limit(20)
      .sort({ name: 1 });

    res.json(connections);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/connection-suggestions
// @desc    Get connection suggestions
// @access  Student only
router.get('/connection-suggestions', studentAuth, async (req, res) => {
  try {
    const { search, course, batch, status } = req.query;
    const student = await User.findById(req.user.id);
    
    let query = { 
      role: 'student', 
      _id: { $ne: student._id },
      batch: { $ne: null }
    };
    
    // Apply filters
    if (course) query.course = new RegExp(course, 'i');
    if (batch) query.batch = batch;
    if (status === 'alumni') query.isAlumni = true;
    if (status === 'student') query.isAlumni = false;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { jobRole: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    // Prioritize alumni and same course students
    const suggestions = await User.find(query)
      .select('-password -email')
      .populate('batch', 'batchName year course')
      .limit(20)
      .sort({ isAlumni: -1, course: student.course === '$course' ? -1 : 1, name: 1 });

    res.json(suggestions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/connection-requests
// @desc    Get pending connection requests
// @access  Student only
router.get('/connection-requests', studentAuth, async (req, res) => {
  try {
    // Mock data - in a real app, you'd have a connection requests collection
    res.json([]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/batch-mates
// @desc    Get batch mates with connection options
// @access  Student only
router.get('/batch-mates', studentAuth, async (req, res) => {
  try {
    const { search, course, status } = req.query;
    const student = await User.findById(req.user.id);
    
    let query = {
      batch: student.batch,
      role: 'student',
      _id: { $ne: student._id }
    };
    
    // Apply filters
    if (course) query.course = new RegExp(course, 'i');
    if (status === 'alumni') query.isAlumni = true;
    if (status === 'student') query.isAlumni = false;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { jobRole: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const batchMates = await User.find(query)
      .select('-password -email')
      .populate('batch', 'batchName year course')
      .sort({ name: 1 });

    // Add mock connection status
    const batchMatesWithStatus = batchMates.map(mate => ({
      ...mate.toObject(),
      connectionStatus: 'none' // none, pending, connected
    }));

    res.json(batchMatesWithStatus);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students/connection-request
// @desc    Send connection request
// @access  Student only
router.post('/connection-request', studentAuth, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    
    // In a real app, you'd create a connection request record
    // For now, just return success
    res.json({ message: 'Connection request sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/connection-request/:id/accept
// @desc    Accept connection request
// @access  Student only
router.put('/connection-request/:id/accept', studentAuth, async (req, res) => {
  try {
    // In a real app, you'd update the connection request and create connection records
    res.json({ message: 'Connection request accepted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/connection-request/:id/reject
// @desc    Reject connection request
// @access  Student only
router.put('/connection-request/:id/reject', studentAuth, async (req, res) => {
  try {
    // In a real app, you'd update the connection request status
    res.json({ message: 'Connection request rejected' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;