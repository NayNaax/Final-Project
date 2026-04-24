# First Fund - Backend

This is the backend server for the First Fund application, built with **Node.js**, **Express**, and **Prisma**.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT

## Core Components

- `src/server.ts`: Entry point of the Express application.
- `src/routes/`: API endpoint definitions (Auth, Portfolio, Learn, Stocks, etc.).
- `src/controllers/`: Business logic handlers for each route.
- `src/services/`: Reusable services (e.g., database queries, external API integrations).
- `src/middleware/`: Global and route-specific middleware (Error handling, Auth validation).
- `prisma/schema.prisma`: Single source of truth for the database schema.

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Prisma CLI (`npm install -g prisma`)

### Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file based on `.env.example` and set your `DATABASE_URL`.
4.  Run migrations:
    ```bash
    npx prisma migrate dev
    ```

### Development

Start the development server with auto-reload:

```bash
npm run dev
```

### Database Management

- Open Prisma Studio to view/edit data:
    ```bash
    npx prisma studio
    ```
- Seed the database:
    ```bash
    npm run db:seed # Uses the custom seed script
    ```
