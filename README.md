# AI Interview Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=111827)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

A full-stack AI interview preparation platform where candidates upload a resume, generate tailored interview questions, answer them in a live session, receive AI feedback, and review progress over time.

## Live Demo

- Frontend: `Coming soon`
- Backend API: `Coming soon`
- Backend API status: `/api/health`

## Features

- JWT authentication with protected candidate routes
- Resume upload and parsing for PDF and DOCX files
- AI resume analysis with skills, strengths, weak areas, projects, and suggested topics
- Resume-powered interview question generation
- Live interview screen with progress, timer, answer submission, and AI evaluation
- Interview result screen with scores, feedback, strengths, improvements, and recommended topics
- Interview history with continue, result review, and delete actions
- Dashboard analytics and recent interview preview
- Responsive React + Tailwind frontend with reusable loading, empty, error, and confirmation states
- Deployment-ready environment configuration for Render, Vercel, and MongoDB Atlas

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| AI | Google Gemini API |
| File Uploads | Multer, PDF/DOCX parsing |
| Deployment Targets | Vercel frontend, Render backend |

## Project Architecture

```text
AI-Interview-Platform/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── DEPLOYMENT.md
├── images/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── LICENSE
└── README.md
```

## Backend API

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Check backend health status |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Login and receive a JWT |

### Resume

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/resume/upload` | Yes | Upload and analyze a resume |
| GET | `/api/resume/me` | Yes | Get the authenticated user's resume |
| DELETE | `/api/resume/delete` | Yes | Delete the authenticated user's resume |

### Interview

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/interview/generate` | Yes | Generate an interview from resume signals |
| GET | `/api/interview/history` | Yes | Get interview history |
| GET | `/api/interview/stats` | Yes | Get dashboard interview stats |
| GET | `/api/interview/:interviewId` | Yes | Get a full interview |
| POST | `/api/interview/:interviewId/answer` | Yes | Submit and evaluate an answer |
| DELETE | `/api/interview/:interviewId` | Yes | Delete an interview |

Protected routes require:

```http
Authorization: Bearer <token>
```

## Local Development

### Prerequisites

- Node.js
- npm
- MongoDB local instance or MongoDB Atlas URI
- Gemini API key

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend local URL:

```text
http://localhost:5000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Create `server/.env` from `server/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Render injects this automatically in production. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | Yes | JWT expiration duration, for example `7d`. |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS. |
| `GEMINI_API_KEY` | Yes | Gemini API key for AI features. |

### Frontend

Create `client/.env` from `client/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL ending in `/api`. |

The frontend requires `VITE_API_URL`. It fails fast if this variable is missing.

## Deployment

Recommended deployment targets:

- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

Deployment guide:

```text
docs/DEPLOYMENT.md
```

Production URL examples:

```text
CLIENT_URL=https://your-app.vercel.app
VITE_API_URL=https://your-api.onrender.com/api
```

Do not commit real secrets or production `.env` files.

## Screenshots

Screenshots will be added after deployment.

```text
images/
├── dashboard-preview.png
├── resume-upload-preview.png
├── interview-session-preview.png
├── interview-result-preview.png
└── interview-history-preview.png
```

## Roadmap

- [x] Express backend API
- [x] MongoDB persistence
- [x] JWT authentication
- [x] Resume upload and parsing
- [x] AI resume analysis
- [x] AI interview generation
- [x] AI answer evaluation
- [x] React frontend
- [x] Dashboard and history
- [x] Live interview flow
- [x] Result review flow
- [x] Deployment documentation
- [ ] Live production deployment
- [ ] Cloud object storage for uploaded resumes
- [ ] Automated tests
- [ ] OpenAPI documentation

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

**Satyam Srivastav**

Building an AI-powered interview preparation platform for smarter, more personalized candidate practice.
