const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // allows null values for admin users
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: function() { return this.role === 'student'; }
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String, // Cloudinary URL
    default: ''
  },
  resume: {
    type: String, // Cloudinary URL
    default: ''
  },
  // Student fields
  course: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  department: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  year: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  // Alumni specific fields (only available when batch is completed)
  isAlumni: {
    type: Boolean,
    default: false
  },
  jobRole: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  workLocation: {
    type: String,
    default: ''
  },
  salary: {
    type: Number,
    default: 0
  },
  experience: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  linkedinProfile: {
    type: String,
    default: ''
  },
  githubProfile: {
    type: String,
    default: ''
  },
  portfolioWebsite: {
    type: String,
    default: ''
  },
  currentStatus: {
    type: String,
    enum: ['studying', 'job_searching', 'employed', 'entrepreneur', 'higher_studies'],
    default: 'studying'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);