# Backend — Job Queue API

NestJS backend for the Mini Job Queue Dashboard built entirely in **JavaScript** with SQLite and TypeORM.

## Tech Stack
- NestJS v12
- TypeORM v0.3
- better-sqlite3
- class-validator & class-transformer
- Babel (legacy decorators & class properties for JavaScript)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Server**:
   ```bash
   npm start
   ```
   Server will start on `http://localhost:3000`. The SQLite database (`database.sqlite`) is created automatically.

3. **Run API & Concurrency Tests**:
   ```bash
   npm test
   ```

## Architecture

- **`src/jobs/dto/`**: Validation DTOs for `POST /jobs` and `PATCH /jobs/:id/status`.
- **`src/jobs/job.entity.js`**: `EntitySchema` definition for SQLite table `jobs`.
- **`src/jobs/jobs.controller.js`**: Route definitions using `@Bind()` decorators for pure JavaScript compatibility.
- **`src/jobs/jobs.service.js`**: Core business logic, status transition validation, and atomic conditional updates for race-condition prevention.
