const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  sharedStudentLists: [{
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    sharedDate: {
      type: Date,
      default: Date.now
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    message: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);