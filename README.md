# 🚀 Portfolio Server

The dedicated backend API for the Dynamic Portfolio, built with Node.js, Express, and TypeScript. This server handles data persistence, authentication, analytics, and third-party integrations.

## ✨ Features

- **RESTful API Architecture**: Structured endpoints for portfolio data, blog posts, and admin operations.
- **Database Management**: MongoDB integration using Prisma ORM.
- **Secure Authentication**: JWT-based auth for admin dashboard and API key protection.
- **Visitor Analytics**: IP-based tracking, geographic insights, and visit counting.
- **Email Integration**: Contact form processing via Resend.
- **Input Validation**: Robust data validation and error handling.
- **TypeScript**: Fully typed codebase for reliability and maintainability.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB & Prisma ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Utilities**: Morgan (logging), Helmet (security), Compression, CORS

## 📁 Project Structure

```bash
server/
├── controllers/       # Request logic and handling
├── lib/               # Shared libraries (Prisma client, etc.)
├── middleware/        # Express middleware (Auth, Error handling)
├── prisma/            # Database schema and migrations
├── routes/            # API route definitions
├── scripts/           # Utility scripts (Seeding, Admin creation)
├── utils/             # Helper functions and loggers
├── index.ts           # Entry point
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas cluster)

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    # Core
    PORT=5000
    NODE_ENV=development

    # Database
    DATABASE_URL="mongodb://localhost:27017/portfolio"

    # Security
    JWT_SECRET="your-super-secret-key"
    ADMIN_API_KEY="your-admin-api-key"
    
    # CORS
    FRONTEND_URLS="http://localhost:3000,https://your-domain.com"

    # Services
    RESEND_API_KEY="your-resend-api-key"
    ```

3.  **Database Setup**:
    Generate the Prisma client:
    ```bash
    npx prisma generate
    ```

    (Optional) Seed the database with initial data:
    ```bash
    npm run seed
    ```

### Running the Server

-   **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```

-   **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## 🧪 Testing & Quality

-   **Run Tests**:
    ```bash
    npm test
    ```
-   **Lint Code**:
    ```bash
    npm run lint
    ```
-   **Format Code**:
    ```bash
    npm run format
    ```

## 📖 API Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/portfolio` | Get public portfolio data | Public |
| `POST` | `/api/contact` | Submit contact form | Public |
| `POST` | `/api/visitors` | Track visitor | Public |
| `POST` | `/api/auth/login` | Admin login | Public |
| `GET` | `/api/admin/*` | Protected admin routes | JWT/API Key |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
