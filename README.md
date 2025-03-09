## Bulk Email Processor

#### A web application to send and track bulk emails using a queue-based approach.

### Features

- User registration and authentication with email verification
- Predefined email templates stored in the database
- Bulk email sending with Excel/CSV file uploads
- Queue-based background processing of emails
- Email status tracking and logs

### Technologies Used

#### Frontend

- React.js
- Tailwind CSS
- Axios for API requests
- React Router for navigation
- React Toastify for notification

#### Backend

- Node.js
- Express.js
- MongoDB for database
- Mailtrap for email sending
- Queue mechanism for background processing

### Setup Instructions

#### Backend Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies with `npm install`
4. Create a `.env` file based on `.env.example`
5. Run database seeds with `npm run seed`
6. Start the server with `npm start` or `npm run dev` for development mode

#### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the React app with `npm start`

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email address

#### Email Templates

- `POST /api/emails/bulk-send `- Upload file and queue emails for sending
- `GET /api/emails/logs` - Get email sending logs

### Environment Variables

#### Backend

- `PORT` - Server port ( 5001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `SMTP_USER` - Mailtrap username
- `SMTP_PASS` - Mailtrap password
- `FRONTEND_URL` - Frontend URL for email verification links

#### Frontend

- `REACT_APP_API_URL` - Backend API URL
