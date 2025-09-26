const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Batch = require('../models/Batch');
const Company = require('../models/Company');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Batch.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleared existing data...');

    // Create Batches
    const batch2020 = await Batch.create({
      batchName: 'CS-2020',
      year: 2020,
      course: 'Computer Science',
      department: 'Engineering',
      startDate: new Date('2020-08-01'),
      endDate: new Date('2024-05-31'),
      isCompleted: true,
      completedDate: new Date('2024-05-31'),
      description: 'Computer Science batch of 2020-2024'
    });

    const batch2021 = await Batch.create({
      batchName: 'CS-2021',
      year: 2021,
      course: 'Computer Science',
      department: 'Engineering',
      startDate: new Date('2021-08-01'),
      endDate: new Date('2025-05-31'),
      isCompleted: false,
      description: 'Computer Science batch of 2021-2025'
    });

    const batch2022 = await Batch.create({
      batchName: 'IT-2022',
      year: 2022,
      course: 'Information Technology',
      department: 'Engineering',
      startDate: new Date('2022-08-01'),
      endDate: new Date('2026-05-31'),
      isCompleted: false,
      description: 'Information Technology batch of 2022-2026'
    });

    console.log('Created batches...');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      phone: '+1234567890'
    });

    console.log('Created admin user...');

    // Create Alumni (from completed batch)
    const alumni = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'CS20001',
        batch: batch2020._id,
        course: 'Computer Science',
        department: 'Engineering',
        year: 4,
        phone: '+1234567891',
        isAlumni: true,
        jobRole: 'Software Engineer',
        company: 'Google',
        workLocation: 'Mountain View, CA',
        salary: 120000,
        experience: '2 years',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        linkedinProfile: 'https://linkedin.com/in/johndoe',
        githubProfile: 'https://github.com/johndoe',
        currentStatus: 'employed'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'CS20002',
        batch: batch2020._id,
        course: 'Computer Science',
        department: 'Engineering',
        year: 4,
        phone: '+1234567892',
        isAlumni: true,
        jobRole: 'Full Stack Developer',
        company: 'Microsoft',
        workLocation: 'Seattle, WA',
        salary: 115000,
        experience: '1.5 years',
        skills: ['C#', '.NET', 'Angular', 'SQL Server'],
        linkedinProfile: 'https://linkedin.com/in/janesmith',
        githubProfile: 'https://github.com/janesmith',
        currentStatus: 'employed'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'CS20003',
        batch: batch2020._id,
        course: 'Computer Science',
        department: 'Engineering',
        year: 4,
        phone: '+1234567893',
        isAlumni: true,
        jobRole: 'Data Scientist',
        company: 'Facebook',
        workLocation: 'Menlo Park, CA',
        salary: 130000,
        experience: '2 years',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
        linkedinProfile: 'https://linkedin.com/in/mikejohnson',
        githubProfile: 'https://github.com/mikejohnson',
        currentStatus: 'employed'
      }
    ];

    for (const alumniData of alumni) {
      await User.create(alumniData);
    }

    console.log('Created alumni users...');

    // Create Current Students
    const currentStudents = [
      {
        name: 'Alice Brown',
        email: 'alice.brown@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'CS21001',
        batch: batch2021._id,
        course: 'Computer Science',
        department: 'Engineering',
        year: 3,
        phone: '+1234567894',
        isAlumni: false,
        skills: ['Java', 'Spring Boot', 'MySQL'],
        linkedinProfile: 'https://linkedin.com/in/alicebrown',
        githubProfile: 'https://github.com/alicebrown',
        currentStatus: 'studying'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'CS21002',
        batch: batch2021._id,
        course: 'Computer Science',
        department: 'Engineering',
        year: 3,
        phone: '+1234567895',
        isAlumni: false,
        skills: ['Python', 'Django', 'PostgreSQL'],
        linkedinProfile: 'https://linkedin.com/in/bobwilson',
        githubProfile: 'https://github.com/bobwilson',
        currentStatus: 'studying'
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@email.com',
        password: 'student123',
        role: 'student',
        studentId: 'IT22001',
        batch: batch2022._id,
        course: 'Information Technology',
        department: 'Engineering',
        year: 2,
        phone: '+1234567896',
        isAlumni: false,
        skills: ['HTML', 'CSS', 'JavaScript'],
        linkedinProfile: 'https://linkedin.com/in/caroldavis',
        githubProfile: 'https://github.com/caroldavis',
        currentStatus: 'studying'
      }
    ];

    for (const studentData of currentStudents) {
      await User.create(studentData);
    }

    console.log('Created current students...');

    // Create Demo Student Account
    await User.create({
      name: 'Demo Student',
      email: 'student@campus.edu',
      password: 'student123',
      role: 'student',
      studentId: 'DEMO001',
      batch: batch2021._id,
      course: 'Computer Science',
      department: 'Engineering',
      year: 3,
      phone: '+1234567890',
      isAlumni: false,
      skills: ['JavaScript', 'React', 'Node.js'],
      currentStatus: 'studying'
    });

    console.log('Created demo student account...');

    // Update batch student counts
    await batch2020.updateStudentCount();
    await batch2021.updateStudentCount();
    await batch2022.updateStudentCount();

    // Create Companies
    const companies = [
      {
        companyName: 'Tech Solutions Inc',
        contactEmail: 'hr@techsolutions.com',
        contactPerson: 'Sarah Manager',
        contactPhone: '+1234567800',
        website: 'https://techsolutions.com',
        description: 'Leading software development company',
        industry: 'Software Development',
        location: 'San Francisco, CA'
      },
      {
        companyName: 'InnovateLab',
        contactEmail: 'careers@innovatelab.com',
        contactPerson: 'David Recruiter',
        contactPhone: '+1234567801',
        website: 'https://innovatelab.com',
        description: 'Innovative technology solutions provider',
        industry: 'Technology',
        location: 'Austin, TX'
      },
      {
        companyName: 'DataCorp',
        contactEmail: 'jobs@datacorp.com',
        contactPerson: 'Lisa Hiring',
        contactPhone: '+1234567802',
        website: 'https://datacorp.com',
        description: 'Data analytics and AI company',
        industry: 'Data Analytics',
        location: 'New York, NY'
      }
    ];

    for (const companyData of companies) {
      await Company.create(companyData);
    }

    console.log('Created companies...');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@campus.edu / admin123');
    console.log('Student: student@campus.edu / student123');
    console.log('\nAlumni accounts (password: student123):');
    console.log('- john.doe@email.com');
    console.log('- jane.smith@email.com'); 
    console.log('- mike.johnson@email.com');
    console.log('\nCurrent student accounts (password: student123):');
    console.log('- alice.brown@email.com');
    console.log('- bob.wilson@email.com');
    console.log('- carol.davis@email.com');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

runSeed();