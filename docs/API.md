# CIB-Management API Documentation

## Authentication

### Login
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### Register
- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```

## Production Management

### Get Productions
- **Endpoint**: `/api/productions`
- **Method**: GET
- **Query Parameters**:
  - `startDate`: string (optional)
  - `endDate`: string (optional)
  - `product`: string (optional)

### Add Production
- **Endpoint**: `/api/productions`
- **Method**: POST
- **Body**:
  ```json
  {
    "date": "string",
    "product": "string",
    "quantity": "number"
  }
  ```

## Revenue Management

### Get Revenues
- **Endpoint**: `/api/revenues`
- **Method**: GET
- **Query Parameters**:
  - `startDate`: string (optional)
  - `endDate`: string (optional)
  - `status`: string (optional)

### Add Revenue
- **Endpoint**: `/api/revenues`
- **Method**: POST
- **Body**:
  ```json
  {
    "date": "string",
    "product": "string",
    "quantity": "number",
    "amount": "number",
    "status": "string"
  }
  ```

## Expense Management

### Get Expenses
- **Endpoint**: `/api/expenses`
- **Method**: GET
- **Query Parameters**:
  - `startDate`: string (optional)
  - `endDate`: string (optional)
  - `category`: string (optional)

### Add Expense
- **Endpoint**: `/api/expenses`
- **Method**: POST
- **Body**:
  ```json
  {
    "date": "string",
    "category": "string",
    "description": "string",
    "amount": "number"
  }
  ```

## Employee Management

### Get Employees
- **Endpoint**: `/api/employees`
- **Method**: GET

### Add Employee
- **Endpoint**: `/api/employees`
- **Method**: POST
- **Body**:
  ```json
  {
    "name": "string",
    "designation": "string",
    "salary": "number",
    "joiningDate": "string"
  }
  ```

### Add Loan
- **Endpoint**: `/api/employees/{employeeId}/loans`
- **Method**: POST
- **Body**:
  ```json
  {
    "amount": "number",
    "reason": "string",
    "date": "string"
  }
  ```

## Reports

### Generate Report
- **Endpoint**: `/api/reports`
- **Method**: POST
- **Body**:
  ```json
  {
    "type": "string",
    "startDate": "string",
    "endDate": "string",
    "format": "string",
    "filters": {
      "category": "string",
      "status": "string"
    }
  }
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string",
  "message": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/register` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Data Formats

- All dates should be in ISO 8601 format
- All monetary values should be in USD
- All numeric values should be sent as numbers, not strings
