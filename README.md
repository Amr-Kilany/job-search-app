# README.md

# Job Search App Backend

A RESTful API & GraphQL backend service built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This backend powers a job search platform supporting user authentication, company profiles, job postings, job application tracking, real-time chat, and administrative reporting.

## Features

- **Authentication & Authorization**: Email/password sign up with OTP confirmation, Google OAuth2 login, JWT access & refresh tokens, and role-based authorization (User, Company HR, Admin).
- **User Management**: Profile management, avatar & cover image upload via Cloudinary/Multer, and password reset workflows.
- **Company Management**: Company profile CRUD operations, logo and cover photo uploads, and manager permissions.
- **Job Opportunities**: Create, update, soft delete, paginated listing, and advanced filtering for job postings.
- **Application Tracking**: Submit job applications, process applicant resumes, and paginate application lists.
- **Real-time Chat**: Socket.io integration for direct messaging between recruiters and job applicants.
- **Admin Dashboard**: GraphQL endpoints for system administration and analytics.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Real-time**: Socket.io
- **API Query Language**: GraphQL (Admin module)
- **File Uploads**: Multer
- **Security & Auth**: JSON Web Tokens (JWT), bcrypt, Google Auth Library

---

## Project Structure

```text
job-search-app-backend/
├── config/
├── src/
│   ├── config/              # Environment configurations
│   ├── DB/                  # Database connection, schemas, and models
│   │   └── Models/          # User, Company, Job, Application, Chat models
│   ├── Middlewares/         # Auth, validation, rate limiting, upload middlewares
│   ├── Modules/             # Feature modules (Admin, Application, Auth, Chat, Company, Job-Opportunity, User)
│   ├── Utils/               # Helpers for security, email events, enums, response handlers
│   ├── app.controller.ts    # Main app controller
│   └── index.ts             # Application entry point
├── Job Search App.postman_collection.json  # Postman API Collection
├── package.json
└── tsconfig.json
```
