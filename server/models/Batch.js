const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Update total students count when batch is saved
batchSchema.methods.updateStudentCount = async function() {
  const User = require('./User');
  const count = await User.countDocuments({ batch: this._id });
  this.totalStudents = count;
  return this.save();
};

module.exports = mongoose.model('Batch', batchSchema);