const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Company = require('../models/Company');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admin/batches
// @desc    Create a new batch
// @access  Admin only
router.post('/batches', adminAuth, [
  body('batchName').notEmpty().withMessage('Batch name is required'),
  body('year').isNumeric().withMessage('Year must be a number'),
  body('course').notEmpty().withMessage('Course is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { batchName, year, course, department, startDate, endDate, description } = req.body;

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchName });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch with this name already exists' });
    }

    const batch = new Batch({
      batchName,
      year,
      course,
      department,
      startDate,
      endDate,
      description
    });

    await batch.save();
    res.status(201).json(batch);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/batches
// @desc    Get all batches
// @access  Admin only
router.get('/batches', adminAuth, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ year: -1, batchName: 1 });
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/batches/:id/complete
// @desc    Mark batch as completed and convert all students to alumni
// @access  Admin only
router.put('/batches/:id/complete', adminAuth, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Update batch status
    batch.isCompleted = true;
    batch.completedDate = new Date();
    await batch.save();

    // Convert all students in this batch to alumni
    await User.updateMany(
      { batch: batch._id, role: 'student' },
      { $set: { isAlumni: true } }
    );

    res.json({ message: 'Batch marked as completed and students converted to alumni', batch });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/students
// @desc    Add a new student
// @access  Admin only
router.post('/students', adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('batch').notEmpty().withMessage('Batch is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('year').isNumeric().withMessage('Year must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, studentId, batch, course, department, year, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Student ID already exists' 
      });
    }

    // Check if batch exists
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) {
      return res.status(400).json({ message: 'Batch not found' });
    }

    const student = new User({
      name,
      email,
      password,
      role: 'student',
      studentId,
      batch,
      course,
      department,
      year,
      phone,
      isAlumni: batchDoc.isCompleted
    });

    await student.save();
    
    // Update batch student count
    await batchDoc.updateStudentCount();

    const populatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('batch');

    res.status(201).json(populatedStudent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students with filtering and sorting
// @access  Admin only
router.get('/students', adminAuth, async (req, res) => {
  try {
    const { batch, isAlumni, course, department, search, sortBy, sortOrder } = req.query;
    
    let query = { role: 'student' };
    
    // Apply filters
    if (batch) query.batch = batch;
    if (isAlumni !== undefined) query.isAlumni = isAlumni === 'true';
    if (course) query.course = new RegExp(course, 'i');
    if (department) query.department = new RegExp(department, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') }
      ];
    }

    // Set up sorting
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions = { name: 1 };
    }

    const students = await User.find(query)
      .select('-password')
      .populate('batch')
      .sort(sortOptions);

    res.json(students);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/students/:id
// @desc    Get student by ID
// @access  Admin only
router.get('/students/:id', adminAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('batch');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student details
// @access  Admin only
router.put('/students/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, studentId, batch, course, department, year, phone } = req.body;
    
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for duplicate email or studentId if they're being changed
    if (email && email !== student.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: student._id } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (studentId && studentId !== student.studentId) {
      const existingStudentId = await User.findOne({ studentId, _id: { $ne: student._id } });
      if (existingStudentId) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (studentId) student.studentId = studentId;
    if (batch) student.batch = batch;
    if (course) student.course = course;
    if (department) student.department = department;
    if (year) student.year = year;
    if (phone) student.phone = phone;

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

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Admin only
router.delete('/students/:id', adminAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Update batch student count
    if (student.batch) {
      const batch = await Batch.findById(student.batch);
      if (batch) {
        await batch.updateStudentCount();
      }
    }

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/companies
// @desc    Add a new company
// @access  Admin only
router.post('/companies', adminAuth, [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/companies
// @desc    Get all companies
// @access  Admin only
router.get('/companies', adminAuth, async (req, res) => {
  try {
    const companies = await Company.find().sort({ companyName: 1 });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/companies/:companyId/share-students
// @desc    Share student list with company
// @access  Admin only
router.post('/companies/:companyId/share-students', adminAuth, [
  body('batchId').notEmpty().withMessage('Batch ID is required'),
  body('message').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { batchId, message } = req.body;
    const companyId = req.params.companyId;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Get all students from the batch
    const students = await User.find({ batch: batchId, role: 'student' });
    const studentIds = students.map(student => student._id);

    // Add to company's shared student lists
    company.sharedStudentLists.push({
      batch: batchId,
      students: studentIds,
      message: message || `Student list for ${batch.batchName}`,
      sharedDate: new Date()
    });

    await company.save();

    res.json({ 
      message: 'Student list shared with company successfully',
      sharedStudents: students.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAlumni = await User.countDocuments({ role: 'student', isAlumni: true });
    const currentStudents = totalStudents - totalAlumni;
    const totalBatches = await Batch.countDocuments();
    const completedBatches = await Batch.countDocuments({ isCompleted: true });
    const activeBatches = totalBatches - completedBatches;
    const totalCompanies = await Company.countDocuments();

    res.json({
      totalStudents,
      currentStudents,
      totalAlumni,
      totalBatches,
      activeBatches,
      completedBatches,
      totalCompanies
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;