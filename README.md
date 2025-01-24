# Patient Medical History Management System

A comprehensive web-based API for managing patient medical records, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

### Core Features

- User Authentication with JWT
- Role-based access control (Practitioners and Patients)
- Complete medical records management
- Real-time data validation
- Soft delete support
- Comprehensive error handling
- Swagger documentation

### Bonus Features

- Patient search functionality
- File upload for lab results (using Cloudinary)
- Dashboard with summary statistics
- Active prescriptions tracking

## Tech Stack

- Node.js & TypeScript
- Express.js
- PostgreSQL with TypeORM
- JWT for authentication
- Zod for validation
- Cloudinary for file storage
- Docker & Docker Compose
- Swagger for API documentation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Docker & Docker Compose
- Cloudinary account

## Setup

1. Clone the repository

```bash
git clone <repository-url>
cd medical-records-api
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=medical_records

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run database migrations

```bash
npm run typeorm:run-migrations
```

5. Start the application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Docker Setup

1. Build and run containers

```bash
docker-compose up --build
```

## API Endpoints

### Authentication

#### Login

```http
POST /auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient|practitioner",
      "profileId": "uuid"
    },
    "token": "jwt_token"
  }
}
```

### Patient Endpoints

#### Get Profile

```http
GET /patient/my-profile
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dateOfBirth": "1990-01-01",
    "bloodType": "A+",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  }
}
```

#### Get Medical Records

```http
GET /patient/my-medical-records
```

Response:

```json
{
  "success": true,
  "data": {
    "allergies": [...],
    "labOrders": [...],
    "prescriptions": [...]
  }
}
```

### Practitioner Endpoints

#### Get Patients List

```http
GET /practitioner/patients
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "patient@example.com"
      },
      "dateOfBirth": "1990-01-01",
      "bloodType": "A+"
    }
  ]
}
```

#### Search Patients

```http
GET /practitioner/patients/search?query=john
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Add Allergy

```http
POST /practitioner/medical-records/:patientId/allergies
```

Request:

```json
{
  "name": "Penicillin",
  "severity": "High",
  "reaction": "Rash",
  "notes": "Avoid all penicillin-based antibiotics"
}
```

#### Create Lab Order

```http
POST /practitioner/medical-records/:patientId/lab-orders
```

Request:

```json
{
  "testType": "Blood Test",
  "instructions": "Fasting required",
  "notes": "Check cholesterol levels"
}
```

#### Add Lab Result

```http
POST /practitioner/medical-records/:patientId/lab-results
```

Request:

```json
{
  "labOrderId": "uuid",
  "resultData": {
    "value": "120",
    "unit": "mg/dL"
  },
  "status": "normal",
  "interpretation": "Within normal range",
  "performedBy": "Dr. Smith"
}
```

#### Upload Lab Result File

```http
POST /practitioner/medical-records/lab-results/:id/file
```

Request:

- Form data with file field named 'file'
- Supports PDF and images (jpg, png)
- Max file size: 5MB

#### Add Prescription

```http
POST /practitioner/medical-records/:patientId/prescriptions
```

Request:

```json
{
  "medication": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2025-01-24",
  "endDate": "2025-01-31",
  "instructions": "Take with food",
  "notes": "For throat infection"
}
```

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

## Running Tests

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
