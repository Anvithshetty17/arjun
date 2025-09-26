# Campus Connect - MERN Stack Application

A comprehensive MERN stack application for managing student lifecycle from enrollment to alumni status, enabling seamless networking, profile management, and recruitment opportunities.

## Features

### Admin Features
- **Student Management**: Add students when they join the college with batch assignment
- **Batch Management**: Create and manage student batches
- **Alumni Promotion**: Promote entire batches to alumni status
- **Company Integration**: Add companies and share student lists for recruitment
- **Dashboard**: View comprehensive statistics and recent activities

### Student Features
- **Profile Management**: Students can view their profiles and update basic information
- **Resume Management**: Students can upload and manage their resumes
- **Alumni Directory**: Browse alumni profiles with advanced filtering and sorting
  - Filter by batch, company, course, department
  - Search by name, job role, company, skills
  - Sort by various criteria
- **Networking**: Connect with alumni and view their professional details

### Alumni Features (Available after batch completion)
- **Extended Profile Management**: Update job-related information
  - Job role, company, work location
  - Salary, experience, skills
  - Achievements, LinkedIn, GitHub profiles
  - Portfolio website, current status
- **Career Information Sharing**: Help current students with career guidance

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads (resumes, profile pictures)
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React.js** with hooks
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **React Query** for data fetching and caching

## Project Structure

```
campus-connect/
├── server/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary configuration
│   │   └── database.js         # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User model (students/admin)
│   │   ├── Batch.js           # Batch model
│   │   └── Company.js         # Company model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── admin.js           # Admin routes
│   │   ├── students.js        # Student routes
│   │   └── upload.js          # File upload routes
│   ├── .env                   # Environment variables
│   ├── index.js              # Server entry point
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/        # Reusable components
│   │   ├── contexts/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── admin/         # Admin pages
│   │   │   └── student/       # Student pages
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── App.js
│   └── package.json
└── package.json              # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd campus-connect
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   npm run install-server
   ```

4. **Install client dependencies**
   ```bash
   npm run install-client
   ```

### Environment Configuration

1. **Server Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/campus-connect
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_complex
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

2. **MongoDB Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGO_URI` in the `.env` file

3. **Cloudinary Setup**
   - Sign up for a free Cloudinary account
   - Get your cloud name, API key, and API secret
   - Update the Cloudinary variables in the `.env` file

### Running the Application

1. **Development Mode (runs both client and server)**
   ```bash
   npm run dev
   ```

2. **Run server only**
   ```bash
   npm run server
   ```

3. **Run client only**
   ```bash
   npm run client
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only for students)
- `GET /api/auth/me` - Get current user

### Admin Routes
- `POST /api/admin/batches` - Create batch
- `GET /api/admin/batches` - Get all batches
- `PUT /api/admin/batches/:id/complete` - Mark batch as completed
- `POST /api/admin/students` - Add student
- `GET /api/admin/students` - Get all students with filters
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student
- `POST /api/admin/companies` - Add company
- `POST /api/admin/companies/:id/share-students` - Share students with company

### Student Routes
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/alumni` - Get alumni with filters
- `GET /api/students/batches` - Get all batches
- `GET /api/students/companies` - Get companies for filtering

### File Upload Routes
- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/resume` - Upload resume
- `DELETE /api/upload/profile-picture` - Delete profile picture
- `DELETE /api/upload/resume` - Delete resume

## Key Business Rules

1. **Student-Alumni Conversion**: Students become alumni only when their batch is marked as completed by admin
2. **Profile Restrictions**: Non-alumni students have limited profile editing capabilities
3. **Resume Management**: Only students can upload/manage resumes
4. **Admin Control**: Only admins can add students, manage batches, and promote batches to alumni
5. **Company Integration**: Admins can share filtered student lists with companies

## User Roles and Permissions

### Admin
- Full access to student and batch management
- Can promote batches to alumni status
- Can manage companies and share student information
- Cannot access student-specific features

### Current Students
- Can view profile and update limited information
- Can upload and manage resume
- Can browse alumni directory with filters
- Cannot edit work-related profile fields

### Alumni
- Can update complete profile including work information
- Can add job details, skills, achievements
- Can manage social profiles and portfolio links
- Can upload and manage resume

## Demo Accounts

### Admin Account
- **Email**: admin@campus.edu
- **Password**: admin123

### Student Account
- **Email**: student@campus.edu
- **Password**: student123

## Development Notes

- The application uses JWT for authentication with 7-day expiry
- File uploads are handled by Cloudinary with size and type restrictions
- Profile pictures: 5MB max, images only
- Resumes: 10MB max, PDF/DOC files only
- The application includes comprehensive error handling and validation
- Responsive design using Material-UI components

## Future Enhancements

- Email notifications for batch promotions
- Advanced analytics dashboard
- Chat/messaging system between students and alumni
- Event management system
- Job posting and application system
- Export functionality for student lists
- Advanced search with Elasticsearch
- Mobile application using React Native

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.