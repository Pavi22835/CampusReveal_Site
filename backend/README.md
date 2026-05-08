# CampusReveal Backend API

Node.js + Express + Prisma + PostgreSQL backend for the CampusReveal platform.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── universityController.js
│   │   ├── reviewController.js
│   │   ├── projectController.js
│   │   └── communityController.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── universities.js
│   │   ├── reviews.js
│   │   ├── projects.js
│   │   └── community.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── utils/
│   │   └── generateToken.js   # JWT utilities
│   └── index.js               # Server entry point
├── .env                        # Environment variables
└── package.json               # Dependencies

```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/campusreveal"
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

**PostgreSQL Connection String Format:**
- Local: `postgresql://username:password@localhost:5432/database_name`
- Remote: `postgresql://username:password@host:5432/database_name`

### 3. Setup Prisma Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Or run migrations
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Universities
- `GET /api/universities` - Get all universities
- `GET /api/universities/:id` - Get single university
- `POST /api/universities` - Create university (admin)
- `PUT /api/universities/:id` - Update university (admin)

### Reviews
- `POST /api/reviews` - Create review (protected)
- `GET /api/reviews/university/:universityId` - Get reviews for university
- `GET /api/reviews/user/my-reviews` - Get user's reviews (protected)
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/university/:universityId` - Get projects for university
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Community
- `GET /api/community/trending` - Get trending universities
- `GET /api/community/comments/:reviewId` - Get comments for review
- `POST /api/community/comments` - Create comment (protected)
- `DELETE /api/community/comments/:id` - Delete comment (protected)

## Database Schema

The database includes the following models:
- **User** - Platform users
- **University** - University information
- **Review** - Reviews for universities
- **Comment** - Comments on reviews
- **Project** - University projects

## Technologies Used

- **Express.js** - Web framework
- **Prisma** - ORM for database
- **PostgreSQL** - SQL database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Development Commands

```bash
npm run dev              # Start development server with hot reload
npm start               # Start production server
npm run prisma:studio   # Open Prisma Studio UI
npm run prisma:generate # Generate Prisma Client
npm run prisma:push     # Sync schema with database
```

## Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcryptjs
- Error handling is centralized via middleware
- All protected routes require Authorization header with Bearer token
