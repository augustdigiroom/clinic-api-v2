# Clinic API v2

A RESTful Clinic Patient Management API built with **TypeScript, Express 5, Prisma ORM, and PostgreSQL**.

Augustine Grepo
www.github.com/augustdigiroom

This project provides API endpoints for managing clinic patients, doctors, and appointments. It demonstrates backend development practices including database relationships, request validation, filtering, sorting, searching, pagination, error handling, and automated testing.

## Project Overview

Clinic API v2 is designed to manage essential clinic operations through a structured REST API.

The application supports three main resources:

- **Patients** – Manage patient records and retrieve patient information.
- **Doctors** – Manage doctor profiles and specializations.
- **Appointments** – Create, retrieve, update, and delete patient appointments, including their associated doctors and patients.

## Features

### 1. Patient Management

- Create, retrieve, update, and delete patient records.
- Retrieve patients using filtering options.
- Search patient records by supported fields.
- Sort patient records by selected fields.
- Paginate patient results.
- Validate query parameters and request data.

### 2. Doctor Management

- Create, retrieve, update, and delete doctor records.
- Filter doctors by specialization.
- Search doctor records.
- Sort doctor results by selected fields.
- Paginate doctor results.
- Validate query parameters and request data.

### 3. Appointment Management

- Create, retrieve, update, and delete appointments.
- Associate appointments with patients and doctors.
- Retrieve appointment records with related patient and doctor information.
- Filter appointments by status, patient ID, doctor ID, and reason.
- Sort and paginate appointment results.
- Validate appointment data and handle invalid database references.

### 4. Data Validation

- Use Zod to validate incoming request data.
- Validate query parameters and resource IDs.
- Reject invalid input and unsupported fields.
- Apply validation rules to appointment creation and updates.

### 5. Database Management

- Use Prisma ORM for database queries and operations.
- Use PostgreSQL for persistent data storage.
- Define relationships between patients, doctors, and appointments.
- Handle database constraints and record-not-found errors.

### 6. Automated Testing

- Use Vitest as the testing framework.
- Use Supertest for HTTP endpoint testing.
- Maintain separate test files for application, patient, doctor, and appointment endpoints.
- Verify successful requests, validation errors, and not-found responses.

## Technologies Used

| Technology                | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| TypeScript                | Strongly typed application development        |
| Node.js                   | JavaScript runtime                            |
| Express 5                 | REST API framework                            |
| PostgreSQL                | Relational database                           |
| Prisma ORM                | Database access and schema management         |
| Zod                       | Request and query validation                  |
| Vitest                    | Automated testing framework                   |
| Supertest                 | HTTP endpoint testing                         |
| dotenv                    | Environment variable configuration            |
| pg                        | PostgreSQL database driver                    |
| Prisma PostgreSQL Adapter | Connects Prisma Client to PostgreSQL          |
| Git                       | Version control                               |
| GitHub                    | Source code hosting and project collaboration |

### Development Tools

- Visual Studio Code
- Postman
- Prisma Studio
- Git Bash

## Project Structure

```text
clinic-api-v2/
│
├── prisma/
│   ├── migrations/
│   │   ├── 0001_baseline/
│   │   │   └── migration.sql
│   │   ├── 20260908021833_create_appointments/
│   │   │   └── migration.sql
│   │   ├── migration_lock.toml
│   │   └── schema.prisma
│
├── src/
│   ├── controllers/
│   │   ├── appointment.controller.ts
│   │   ├── doctor.controller.ts
│   │   └── patient.controller.ts
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── queries/
│   │   ├── appointment.query.ts
│   │   ├── doctor.query.ts
│   │   └── patient.query.ts
│   │
│   ├── routes/
│   │   ├── appointment.routes.ts
│   │   ├── doctor.routes.ts
│   │   └── patient.routes.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── app.test.ts
│   ├── appointment.test.ts
│   ├── doctor.test.ts
│   └── patient.test.ts
│
├── generated/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

### Folder Responsibilities

| Folder/File        | Responsibility                                               |
| ------------------ | ------------------------------------------------------------ |
| `prisma/`          | Database schema and migration history                        |
| `src/controllers/` | Handles API requests and responses                           |
| `src/lib/`         | Shared application utilities and Prisma client               |
| `src/queries/`     | Database filtering, sorting, searching, and pagination logic |
| `src/routes/`      | Defines API endpoints and connects them to controllers       |
| `src/app.ts`       | Configures the Express application                           |
| `src/server.ts`    | Starts the HTTP server                                       |
| `tests/`           | Contains automated API tests                                 |
| `generated/`       | Generated Prisma Client                                      |
| `prisma.config.ts` | Prisma configuration                                         |
| `tsconfig.json`    | TypeScript compiler configuration                            |

## Database Models and Relationships

The project uses three PostgreSQL models managed through Prisma ORM.

### 1. Doctors

Stores doctor information.

| Field            | Type   | Description                 |
| ---------------- | ------ | --------------------------- |
| `id`             | Int    | Primary key, auto-increment |
| `first_name`     | String | Doctor's first name         |
| `last_name`      | String | Doctor's last name          |
| `specialization` | String | Medical specialization      |

**Relationships:**

- One doctor can be associated with multiple patients.
- One doctor can have multiple appointments.

### 2. Patients

Stores patient information.

| Field            | Type    | Description                    |
| ---------------- | ------- | ------------------------------ |
| `id`             | Int     | Primary key, auto-increment    |
| `first_name`     | String  | Patient's first name           |
| `last_name`      | String  | Patient's last name            |
| `age`            | Int?    | Optional patient age           |
| `gender`         | String? | Optional gender                |
| `diagnosis`      | String? | Optional diagnosis             |
| `contact_number` | String? | Optional unique contact number |
| `doctor_id`      | Int?    | Optional reference to a doctor |

**Relationships:**

- A patient can be associated with an optional doctor.
- One patient can have multiple appointments.
- The `last_name` field has a database index.

### 3. Appointments

Stores patient appointment information.

| Field              | Type     | Description                 |
| ------------------ | -------- | --------------------------- |
| `id`               | Int      | Primary key, auto-increment |
| `patient_id`       | Int      | Required patient reference  |
| `doctor_id`        | Int?     | Optional doctor reference   |
| `appointment_date` | DateTime | Appointment date and time   |
| `reason`           | String   | Appointment reason          |
| `status`           | String   | Appointment status          |

**Relationships and Referential Actions:**

- Each appointment belongs to one patient.
- An appointment can optionally be assigned to a doctor.
- Deleting a patient automatically deletes their associated appointments (`onDelete: Cascade`).
- Deleting a doctor sets the appointment's `doctor_id` to `NULL` (`onDelete: SetNull`).

### Relationship Overview

- **Doctors ↔ Patients:** A doctor can be associated with multiple patients; a patient can have an optional doctor.
- **Patients → Appointments:** One-to-many relationship.
- **Doctors → Appointments:** One-to-many relationship, with an optional doctor assignment.

## API Endpoints

All API routes are prefixed with `/api`.

### Patient Endpoints

Base URL: `/api/patients`

| Method | Endpoint            | Description                                                              |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| GET    | `/api/patients`     | Retrieve all patients with filtering, searching, sorting, and pagination |
| GET    | `/api/patients/:id` | Retrieve a specific patient's profile                                    |
| POST   | `/api/patients`     | Create a new patient                                                     |
| PATCH  | `/api/patients/:id` | Update an existing patient                                               |
| DELETE | `/api/patients/:id` | Delete a patient                                                         |

### Doctor Endpoints

Base URL: `/api/doctors`

| Method | Endpoint           | Description                                                             |
| ------ | ------------------ | ----------------------------------------------------------------------- |
| GET    | `/api/doctors`     | Retrieve all doctors with filtering, searching, sorting, and pagination |
| GET    | `/api/doctors/:id` | Retrieve a specific doctor's profile                                    |
| POST   | `/api/doctors`     | Create a new doctor                                                     |
| PATCH  | `/api/doctors/:id` | Update an existing doctor                                               |
| DELETE | `/api/doctors/:id` | Delete a doctor                                                         |

### Appointment Endpoints

Base URL: `/api/appointments`

| Method | Endpoint                               | Description                                                              |
| ------ | -------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/api/appointments`                    | Retrieve appointments with filtering, searching, sorting, and pagination |
| GET    | `/api/appointments/:id`                | Retrieve a specific appointment                                          |
| GET    | `/api/appointments/patient/:patientId` | Retrieve appointments associated with a patient                          |
| GET    | `/api/appointments/doctor/:doctorId`   | Retrieve appointments associated with a doctor                           |
| POST   | `/api/appointments`                    | Create a new appointment                                                 |
| PATCH  | `/api/appointments/:id`                | Update an existing appointment                                           |
| DELETE | `/api/appointments/:id`                | Delete an appointment                                                    |

### HTTP Methods

- **GET** – Retrieve resources.
- **POST** – Create new resources.
- **PATCH** – Update existing resources.
- **DELETE** – Remove resources.

## Query Parameters and API Usage Examples

The API supports query-based filtering, searching, sorting, and pagination to make resource retrieval more flexible.

### 1. Patient Query Parameters

Endpoint: `GET /api/patients`

| Parameter | Description                                                 | Example            |
| --------- | ----------------------------------------------------------- | ------------------ |
| `gender`  | Filter patients by gender                                   | `gender=Female`    |
| `minAge`  | Filter by minimum age                                       | `minAge=18`        |
| `maxAge`  | Filter by maximum age                                       | `maxAge=60`        |
| `search`  | Search by first name or last name                           | `search=Santos`    |
| `sortBy`  | Sort by `id`, `first_name`, `last_name`, `age`, or `gender` | `sortBy=last_name` |
| `order`   | Sorting direction: `asc` or `desc`                          | `order=asc`        |

**Example requests:**

```http
GET /api/patients?gender=Female
GET /api/patients?minAge=18&maxAge=60
GET /api/patients?search=Santos
GET /api/patients?sortBy=last_name&order=asc
```

### 2. Doctor Query Parameters

Endpoint: `GET /api/doctors`

| Parameter        | Description                                                  | Example                     |
| ---------------- | ------------------------------------------------------------ | --------------------------- |
| `specialization` | Filter by medical specialization                             | `specialization=Cardiology` |
| `search`         | Search by first name or last name                            | `search=Garcia`             |
| `sortBy`         | Sort by `id`, `first_name`, `last_name`, or `specialization` | `sortBy=last_name`          |
| `order`          | Sorting direction: `asc` or `desc`                           | `order=desc`                |

**Example requests:**

```http
GET /api/doctors?specialization=Cardiology
GET /api/doctors?search=Garcia
GET /api/doctors?sortBy=last_name&order=asc
```

### 3. Appointment Query Parameters

Endpoint: `GET /api/appointments`

| Parameter   | Description                                                              | Example                   |
| ----------- | ------------------------------------------------------------------------ | ------------------------- |
| `status`    | Filter by appointment status                                             | `status=SCHEDULED`        |
| `patientId` | Filter by patient ID                                                     | `patientId=2`             |
| `doctorId`  | Filter by doctor ID                                                      | `doctorId=3`              |
| `reason`    | Search appointment reasons                                               | `reason=consultation`     |
| `sortBy`    | Sort by `id`, `appointment_date`, `status`, `patient_id`, or `doctor_id` | `sortBy=appointment_date` |
| `order`     | Sorting direction: `asc` or `desc`                                       | `order=desc`              |

**Example requests:**

```http
GET /api/appointments?status=SCHEDULED
GET /api/appointments?patientId=2
GET /api/appointments?doctorId=3
GET /api/appointments?reason=consultation
GET /api/appointments?sortBy=appointment_date&order=desc
```

## API Testing

The project uses **Vitest** and **Supertest** for automated API testing to verify endpoint behavior, request validation, and database operations.

### Testing Tools

- **Vitest** – Test runner and assertion library.
- **Supertest** – HTTP testing library for testing Express endpoints.

### Test Coverage

The automated test suite covers the following areas:

| Test File             | Coverage                                              |
| --------------------- | ----------------------------------------------------- |
| `app.test.ts`         | Application-level checks                              |
| `patient.test.ts`     | Patient API endpoints and operations                  |
| `doctor.test.ts`      | Doctor API endpoints and operations                   |
| `appointment.test.ts` | Appointment API endpoints, validation, and operations |

### Areas Tested

- API endpoint responses and HTTP status codes
- Patient, doctor, and appointment CRUD operations
- Filtering, searching, and sorting
- Pagination and query parameter validation
- Request body validation using Zod
- Invalid resource IDs and database reference errors
- Appointment relationships and database behavior

### Running the Tests

Run the complete automated test suite:

```bash
npm test
```

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

### Test Results

**Latest recorded test execution:**

- Test files: 4 passed
- Tests: 40 passed
- TypeScript type checking: Passed

All 40 automated tests passed in the recorded test execution.

## Installation and Setup

Follow these steps to run Clinic API v2 locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/augustdigiroom/clinic-api-v2.git
```

Navigate into the project directory:

```bash
cd clinic-api-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root directory.

Add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/clinic_postgres?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your local PostgreSQL credentials.

**Important:** Never commit your `.env` file or expose database credentials in your GitHub repository.

### 4. Configure the Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE clinic_postgres;
```

Make sure your PostgreSQL server is running and your `DATABASE_URL` points to the correct database.

### 5. Run Prisma Migrations

Apply the existing database migrations:

```bash
npx prisma migrate deploy
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

### 8. Run Automated Tests

```bash
npm test
```

### 9. Run TypeScript Type Checking

```bash
npx tsc --noEmit
```

## Installation and Setup

Follow these steps to run Clinic API v2 locally.

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/augustdigiroom/clinic-api-v2.git
cd clinic-api-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root directory.

Add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/clinic_postgres?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

**Important:** Never commit your `.env` file or expose database credentials in your repository.

### 4. Create the PostgreSQL Database

Create a database named `clinic_postgres` using PostgreSQL or your preferred database management tool.

### 5. Apply Database Migrations

Run the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

### 8. Run Automated Tests

```bash
npm test
```

### 9. Run TypeScript Type Checking

```bash
npx tsc --noEmit
```

### Environment Configuration

Prisma loads environment variables through `dotenv/config` in `prisma.config.ts`.

The `DATABASE_URL` environment variable is used to establish the PostgreSQL database connection.

## Copyright and Ownership

Copyright © 2026 Augustine Grepo. All rights reserved.

www.github.com/augustdigiroom

This project is an original software development portfolio project. The original source code, documentation, and project materials are protected by applicable copyright laws.

Viewing this repository does not grant permission to copy, reproduce, redistribute, modify, or commercially use its original work without prior written permission from the copyright owner, except where permitted by applicable law or third-party licenses.

Third-party libraries, frameworks, and dependencies remain subject to their respective licenses.
