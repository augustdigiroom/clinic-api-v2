# Clinic API v2

A RESTful Clinic Patient Management API built with **TypeScript, Express
5, Prisma ORM, and PostgreSQL**.

Augustine Grepo www.github.com/augustdigiroom

Clinic API v2 provides endpoints for managing patients, doctors, and
appointments. It demonstrates backend development practices including
relational database management, request validation, filtering,
searching, sorting, pagination, centralized error handling, and
automated testing.

## Project Overview

The application supports three main resources:

- **Patients** -- Manage patient records and retrieve patient
  information.
- **Doctors** -- Manage doctor profiles and medical specializations.
- **Appointments** -- Create, retrieve, update, and delete
  appointments associated with patients and doctors.

## Features

### 1. Patient Management

- Create, retrieve, update, and delete patient records.
- Filter patients by gender and age range.
- Search by first name and last name.
- Sort and paginate patient results.
- Validate request data and query parameters.

### 2. Doctor Management

- Create, retrieve, update, and delete doctor records.
- Filter doctors by specialization.
- Search by first name and last name.
- Sort and paginate doctor results.
- Validate request data and query parameters.

### 3. Appointment Management

- Create, retrieve, update, and delete appointments.
- Associate appointments with patients and doctors.
- Retrieve appointments by patient or doctor.
- Filter appointments by status, patient ID, doctor ID, and reason.
- Sort and paginate appointment results.
- Handle invalid database references and record-not-found errors.

### 4. Data Validation

- Use Zod for request validation.
- Validate query parameters and resource IDs.
- Reject invalid input and unsupported fields.
- Apply validation rules to resource creation and updates.

### 5. Database Management

- Use Prisma ORM for database operations.
- Use PostgreSQL for persistent data storage.
- Define relationships between patients, doctors, and appointments.
- Handle database constraints and referential actions.

### 6. Automated Testing

- Use Vitest as the testing framework.
- Use Supertest for HTTP endpoint testing.
- Test API controllers and query-building functions.
- Test successful requests, validation errors, and error handling.
- Measure code coverage using Vitest's V8 coverage provider.

## Technologies Used

Technology Purpose

---

TypeScript Strongly typed application development
Node.js JavaScript runtime
Express 5 REST API framework
PostgreSQL Relational database
Prisma ORM Database access and schema management
Zod Request and query validation
Vitest Automated testing
Supertest HTTP endpoint testing
dotenv Environment variable configuration
pg PostgreSQL database driver
Prisma PostgreSQL Adapter Prisma database connectivity
Git and GitHub Version control and source code hosting

### Development Tools

- Visual Studio Code
- Postman
- Prisma Studio
- Git Bash

## Project Structure

```text
clinic-api-v2/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   ├── lib/
│   ├── middleware/
│   ├── queries/
│   ├── routes/
│   ├── validations/
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── app.test.ts
│   ├── patient.test.ts
│   ├── doctor.test.ts
│   ├── appointment.test.ts
│   ├── patient.query.test.ts
│   ├── doctor.query.test.ts
│   ├── appointment.query.test.ts
│   ├── doctor.error.test.ts
│   └── appointment.controller.test.ts
│
├── generated/
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Database Models and Relationships

The project uses three PostgreSQL models managed through Prisma ORM.

### 1. Doctors

Stores doctor information.

Field Type Description

---

`id` Int Primary key, auto-increment
`first_name` String Doctor's first name
`last_name` String Doctor's last name
`specialization` String Medical specialization

**Relationships:**

- One doctor can be associated with multiple patients.
- One doctor can have multiple appointments.

### 2. Patients

Stores patient information.

Field Type Description

---

`id` Int Primary key, auto-increment
`first_name` String Patient's first name
`last_name` String Patient's last name
`age` Int? Optional patient age
`gender` String? Optional gender
`diagnosis` String? Optional diagnosis
`contact_number` String? Optional unique contact number
`doctor_id` Int? Optional doctor reference

**Relationships:**

- A patient can be associated with an optional doctor.
- One patient can have multiple appointments.
- The `last_name` field has a database index.

### 3. Appointments

Stores patient appointment information.

Field Type Description

---

`id` Int Primary key, auto-increment
`patient_id` Int Required patient reference
`doctor_id` Int? Optional doctor reference
`appointment_date` DateTime Appointment date and time
`reason` String Appointment reason
`status` String Appointment status

**Relationships and Referential Actions:**

- Each appointment belongs to one patient.
- An appointment can optionally be assigned to a doctor.
- Deleting a patient automatically deletes associated appointments
  (`onDelete: Cascade`).
- Deleting a doctor sets the appointment's `doctor_id` to `NULL`
  (`onDelete: SetNull`).

## API Endpoints

All API routes are prefixed with `/api`.

### Patient Endpoints

---

Method Endpoint Description

---

GET `/api/patients` Retrieve patients with
filtering, searching,
sorting, and pagination

GET `/api/patients/:id` Retrieve a specific
patient

POST `/api/patients` Create a patient

PATCH `/api/patients/:id` Update a patient

DELETE `/api/patients/:id` Delete a patient

---

### Doctor Endpoints

---

Method Endpoint Description

---

GET `/api/doctors` Retrieve doctors with
filtering, searching,
sorting, and pagination

GET `/api/doctors/:id` Retrieve a specific
doctor

POST `/api/doctors` Create a doctor

PATCH `/api/doctors/:id` Update a doctor

DELETE `/api/doctors/:id` Delete a doctor

---

### Appointment Endpoints

---

Method Endpoint Description

---

GET `/api/appointments` Retrieve appointments
with filtering,
searching, sorting, and
pagination

GET `/api/appointments/:id` Retrieve a specific
appointment

GET `/api/appointments/patient/:patientId` Retrieve appointments
by patient

GET `/api/appointments/doctor/:doctorId` Retrieve appointments
by doctor

POST `/api/appointments` Create an appointment

PATCH `/api/appointments/:id` Update an appointment

DELETE `/api/appointments/:id` Delete an appointment

---

## Query Parameters and API Usage

The API supports filtering, searching, sorting, and pagination.

### Patient Queries

Endpoint: `GET /api/patients`

Parameter Description Example

---

`gender` Filter by gender `gender=Female`
`minAge` Minimum age `minAge=18`
`maxAge` Maximum age `maxAge=60`
`search` Search first or last name `search=Santos`
`sortBy` Sort by supported patient fields `sortBy=last_name`
`order` Sort direction: `asc` or `desc` `order=asc`
`page` Page number `page=2`
`limit` Results per page `limit=10`

Examples:

```http
GET /api/patients?gender=Female
GET /api/patients?minAge=18&maxAge=60
GET /api/patients?search=Santos
GET /api/patients?sortBy=last_name&order=asc
GET /api/patients?page=2&limit=10
```

### Doctor Queries

Endpoint: `GET /api/doctors`

---

Parameter Description Example

---

`specialization` Filter by `specialization=Cardiology`
specialization

`search` Search first or last `search=Garcia`
name

`sortBy` Sort by supported `sortBy=last_name`
doctor fields

`order` Sort direction `order=desc`

`page` Page number `page=2`

`limit` Results per page `limit=10`

---

Examples:

```http
GET /api/doctors?specialization=Cardiology
GET /api/doctors?search=Garcia
GET /api/doctors?sortBy=last_name&order=asc
GET /api/doctors?page=2&limit=10
```

### Appointment Queries

Endpoint: `GET /api/appointments`

---

Parameter Description Example

---

`status` Filter by appointment `status=SCHEDULED`
status

`patientId` Filter by patient ID `patientId=2`

`doctorId` Filter by doctor ID `doctorId=3`

`reason` Search appointment `reason=consultation`
reasons

`sortBy` Sort by supported `sortBy=appointment_date`
appointment fields

`order` Sort direction `order=desc`

`page` Page number `page=2`

`limit` Results per page `limit=10`

---

Examples:

```http
GET /api/appointments?status=SCHEDULED
GET /api/appointments?patientId=2
GET /api/appointments?doctorId=3
GET /api/appointments?reason=consultation
GET /api/appointments?sortBy=appointment_date&order=desc
GET /api/appointments?page=2&limit=10
```

## API Testing

The project uses **Vitest** and **Supertest** for automated testing.

### Testing Approach

The test suite includes:

- API integration tests for patient, doctor, and appointment
  endpoints.
- Controller unit tests using mocked database operations.
- Query-builder unit tests for filtering and sorting logic.
- Error-handling tests.
- Validation and invalid-input tests.

### Running Tests

Run the complete test suite:

```bash
npm test
```

Run tests with code coverage:

```bash
npm run test:coverage
```

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

### Latest Recorded Test Results

Metric Result

---

Test files passed 9
Tests passed 187
Statement coverage 96.68%
Branch coverage 89.96%
Function coverage 100%
Line coverage 96.68%

All 187 tests passed in the latest recorded coverage run.

_Coverage figures represent the latest recorded local test execution and
may change as the project evolves._

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

Create a `.env` file in the project root.

Add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/clinic_postgres?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

**Important:** Never commit your `.env` file or expose database
credentials in your GitHub repository.

### 4. Create the PostgreSQL Database

Create a database named:

```sql
CREATE DATABASE clinic_postgres;
```

Make sure your PostgreSQL server is running and your `DATABASE_URL`
points to the correct database.

### 5. Apply Database Migrations

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

The API server currently runs on:

```text
http://localhost:5000
```

### 8. Run Automated Tests

```bash
npm test
```

### 9. Run Tests with Coverage

```bash
npm run test:coverage
```

### 10. Run TypeScript Type Checking

```bash
npx tsc --noEmit
```

## Future Improvements

Potential areas for future development include:

- API documentation with Swagger or OpenAPI.
- Authentication and role-based authorization.
- Production deployment.
- Additional security and performance improvements.
- Integration with AI-powered healthcare applications.

## Copyright and Ownership

Copyright © Augustine Grepo 2026. All rights reserved.

GitHub: https://github.com/augustdigiroom/clinic-api-v2

www.github.com/augustdigiroom

This project is a software development portfolio project. Third-party
libraries, frameworks, and dependencies remain subject to their
respective licenses.
