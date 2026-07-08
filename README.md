# AI Interview Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

A modern AI-powered interview preparation platform designed to help candidates upload resumes, practice interviews, receive intelligent questions, and track progress with personalized feedback.

The project currently includes a production-style Express backend with authentication, protected routes, MongoDB persistence, and resume upload support. AI parsing, interview generation, dashboard analytics, and frontend experiences are planned for upcoming milestones.

## Features

### Current

- ✅ Express backend API
- ✅ MongoDB database integration with Mongoose
- ✅ JWT authentication
- ✅ User registration API
- ✅ User login API
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Resume upload API
- ✅ Multer file upload configuration
- ✅ PDF and DOCX resume validation
- ✅ 10MB resume upload limit
- ✅ Replace existing resume on re-upload
- ✅ Centralized error handling

### Upcoming

- 🚀 AI resume parsing
- 🚀 Gemini API integration
- 🚀 AI interview question generator
- 🚀 Voice interview experience
- 🚀 AI answer feedback
- 🚀 Candidate dashboard
- 🚀 Interview analytics
- 🚀 Progress tracking
- 🚀 Frontend application

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| File Uploads | Multer |
| Environment Config | dotenv |
| API Security Foundation | Protected routes, validation, CORS |
| Planned Frontend | React.js, Tailwind CSS |
| Planned AI | Gemini API |

## Folder Structure

```text
AI-Interview-Platform/
├── client/
│   └── .gitkeep
├── docs/
│   └── .gitkeep
├── images/
│   └── .gitkeep
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── multer.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── resumeController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── Resume.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   └── resumeRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   │   └── resumes/
│   │       └── .gitkeep
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── LICENSE
└── README.md
```

## Backend Architecture

The backend follows a clean MVC-style structure:

- `server.js` starts the application and connects to MongoDB.
- `app.js` configures Express middleware, CORS, route mounting, and error handling.
- `config/` contains infrastructure configuration such as MongoDB and Multer.
- `models/` contains Mongoose schemas for persistent data.
- `controllers/` contains request handlers and business logic.
- `routes/` defines API endpoints and route-level middleware.
- `middleware/` contains reusable authentication and error handling logic.

Authentication is handled with JWT bearer tokens. Protected routes require:

```http
Authorization: Bearer <token>
```

Resume uploads are stored locally in:

```text
server/uploads/resumes/
```

Uploaded resume files are ignored by Git to avoid committing user data.

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Check backend health status |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a JWT |

### Resume

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/resume/upload` | Yes | Upload a PDF or DOCX resume |
| GET | `/api/resume/me` | Yes | Get the authenticated user's resume |
| DELETE | `/api/resume/delete` | Yes | Delete the authenticated user's resume |

### Resume Upload Request

Use `multipart/form-data` with the field name:

```text
resume
```

Supported file types:

- `.pdf`
- `.docx`

Maximum file size:

```text
10MB
```

## Installation Guide

### Prerequisites

- Node.js
- npm
- MongoDB local instance or MongoDB Atlas connection string

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

For production-style startup:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

## Environment Variables

Create `server/.env` from `server/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-interview-platform
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
| --- | --- |
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `CLIENT_URL` | Allowed frontend origin for CORS |

## Screenshots

Screenshots will be added as the frontend is built.

```text
images/
├── dashboard-preview.png
├── interview-session-preview.png
└── resume-upload-preview.png
```

## Roadmap

- [x] Project repository setup
- [x] Express backend setup
- [x] MongoDB connection
- [x] User model
- [x] Register API
- [x] Login API
- [x] JWT auth middleware
- [x] Resume model
- [x] Resume upload API
- [x] Protected resume routes
- [ ] AI resume parsing
- [ ] Gemini API integration
- [ ] AI interview question generation
- [ ] Answer evaluation
- [ ] Voice interview mode
- [ ] Candidate dashboard
- [ ] Analytics and progress tracking
- [ ] Frontend application
- [ ] Deployment

## Future Improvements

- Add request validation with a schema validation library.
- Add rate limiting for authentication and upload routes.
- Add refresh tokens or secure HTTP-only cookie auth.
- Add cloud file storage for resumes.
- Extract resume text from PDF and DOCX files.
- Generate role-specific interview questions using Gemini.
- Score answers using AI feedback rubrics.
- Add admin/recruiter roles.
- Add automated tests for controllers and middleware.
- Add API documentation with OpenAPI/Swagger.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request with a clear description.

Please keep changes focused, documented, and aligned with the project roadmap.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

**Satyam Srivastav**

Building an AI-powered interview preparation platform for smarter, more personalized candidate practice.
