# API Documentation

This document provides comprehensive API documentation for the Momentum SWELAB backend API.

## Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: `https://your-backend-service.onrender.com`

## Authentication

Most endpoints require user authentication via session management. Authentication is handled through the `/login` endpoint, which establishes a session.

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Endpoints

### Health Check

#### GET `/health`

Check the health status of the API and database connection.

**Response:**
```json
{
  "status": "healthy",
  "mongodb_connected": true,
  "message": "All systems operational"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### User Management

#### POST `/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Status Codes:**
- `200 OK` - Registration successful
- `400 Bad Request` - Missing required fields or validation error

**Example:**
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### POST `/login`

Authenticate a user and establish a session.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "userId": "john" // Optional, for backward compatibility
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": "john"
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

**Example:**
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

#### POST `/forgot-password`

Request a password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Status Codes:**
- `200 OK` - Request processed (always returns success for security)
- `400 Bad Request` - Missing email field

#### POST `/add_user`

Add a new user (legacy endpoint, prefer `/register`).

**Request Body:**
```json
{
  "username": "johndoe",
  "userId": "john",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User added successfully"
}
```

---

### Project Management

#### POST `/create_project`

Create a new project.

**Request Body:**
```json
{
  "projectName": "Machine Learning Research",
  "projectId": "ML-2024-001",
  "description": "Research project on neural networks" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully"
}
```

**Status Codes:**
- `200 OK` - Project created successfully
- `400 Bad Request` - Missing required fields or project ID already exists

**Example:**
```bash
curl -X POST http://localhost:5000/create_project \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "ML Research",
    "projectId": "ML-2024-001",
    "description": "Machine learning research project"
  }'
```

#### POST `/join_project`

Join an existing project.

**Request Body:**
```json
{
  "userId": "john",
  "projectId": "ML-2024-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined project"
}
```

**Status Codes:**
- `200 OK` - Successfully joined project
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Project not found

#### POST `/remove_user_from_project`

Remove a user from a project (leave project).

**Request Body:**
```json
{
  "userId": "john",
  "projectId": "ML-2024-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User left project"
}
```

#### POST `/get_project_info`

Get information about a specific project.

**Request Body:**
```json
{
  "projectId": "ML-2024-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "ML-2024-001",
    "projectName": "Machine Learning Research",
    "description": "Research project on neural networks",
    "users": ["john", "jane"],
    "hardware": {
      "HWSet1": 5,
      "HWSet2": 3
    }
  }
}
```

#### POST `/get_user_projects_list`

Get all projects that a user belongs to.

**Request Body:**
```json
{
  "userId": "john"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectId": "ML-2024-001",
      "projectName": "Machine Learning Research"
    },
    {
      "projectId": "AI-2024-002",
      "projectName": "AI Research Project"
    }
  ]
}
```

#### GET `/main`

Get user projects (legacy endpoint, prefer `/get_user_projects_list`).

**Query Parameters:**
- `userId` (required) - User ID

**Response:**
```json
{
  "success": true,
  "data": [ /* array of projects */ ]
}
```

---

### Hardware Management

#### GET `/get_all_hardware`

Get all hardware sets with full details.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "HWSet1",
      "capacity": 50,
      "availability": 45,
      "checkedOut": 5
    },
    {
      "name": "HWSet2",
      "capacity": 100,
      "availability": 97,
      "checkedOut": 3
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success

**Example:**
```bash
curl http://localhost:5000/get_all_hardware
```

#### GET `/get_all_hw_names`

Get list of all hardware set names (legacy endpoint).

**Response:**
```json
{
  "success": true,
  "data": ["HWSet1", "HWSet2"]
}
```

#### POST `/get_hw_info`

Get information about a specific hardware set.

**Request Body:**
```json
{
  "hwSetName": "HWSet1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "HWSet1",
    "capacity": 50,
    "availability": 45,
    "checkedOut": 5
  }
}
```

#### POST `/check_out`

Check out hardware from a hardware set for a project.

**Request Body:**
```json
{
  "projectId": "ML-2024-001",
  "hwSetName": "HWSet1",
  "qty": 5,
  "userId": "john"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hardware checked out successfully",
  "availability": 40
}
```

**Status Codes:**
- `200 OK` - Checkout successful
- `400 Bad Request` - Missing required fields, invalid quantity, or insufficient availability

**Example:**
```bash
curl -X POST http://localhost:5000/check_out \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "ML-2024-001",
    "hwSetName": "HWSet1",
    "qty": 5,
    "userId": "john"
  }'
```

#### POST `/check_in`

Check in hardware back to a hardware set from a project.

**Request Body:**
```json
{
  "projectId": "ML-2024-001",
  "hwSetName": "HWSet1",
  "qty": 3,
  "userId": "john"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hardware checked in successfully",
  "availability": 48
}
```

**Status Codes:**
- `200 OK` - Check-in successful
- `400 Bad Request` - Missing required fields, invalid quantity, or attempting to check in more than checked out

**Example:**
```bash
curl -X POST http://localhost:5000/check_in \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "ML-2024-001",
    "hwSetName": "HWSet1",
    "qty": 3,
    "userId": "john"
  }'
```

#### POST `/create_hardware_set`

Create a new hardware set (admin function).

**Request Body:**
```json
{
  "hwSetName": "HWSet3",
  "initCapacity": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hardware set created successfully"
}
```

**Status Codes:**
- `200 OK` - Hardware set created successfully
- `400 Bad Request` - Missing required fields or hardware set already exists

#### GET `/api/inventory`

Get inventory of all projects (admin function).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "projectId": "ML-2024-001",
      "projectName": "Machine Learning Research",
      "hardware": {
        "HWSet1": 5,
        "HWSet2": 3
      }
    }
  ]
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "projectId, hwSetName, qty, and userId are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Project not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000` (local frontend)
- `http://localhost:5000` (local backend)
- `https://Code-Tomato.github.io` (GitHub Pages)

Additional origins can be configured via the `ALLOWED_ORIGINS` environment variable.

## Versioning

Current API version: **v1**

No versioning scheme is currently implemented. Future versions may include versioning via URL path (e.g., `/api/v1/`) or headers.

## OpenAPI Specification

For an interactive API explorer, see the OpenAPI specification file (to be generated) or use tools like Swagger UI or Postman to import the API endpoints.

## Support

For API support or questions:
- Open an issue on GitHub
- Check the [README.md](../README.md) for setup instructions
- Review [ARCHITECTURE.md](../ARCHITECTURE.md) for system design details

