# Authentication System Documentation

## Overview
This authentication system provides secure login functionality for the Management System using JWT (JSON Web Tokens).

## Setup

### 1. Dependencies
The following packages are required:
- `jsonwebtoken` - For creating and verifying JWT tokens
- `bcryptjs` - For password hashing (future enhancement)

### 2. Environment Variables
Create a `.env` file in the backend directory with:
```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
PORT=8000
```

## API Endpoints

### Login
- **URL:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
  ```

### Verify Token
- **URL:** `GET /api/auth/verify`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Token is valid",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
  ```

### Logout
- **URL:** `POST /api/auth/logout`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

## Default Credentials
- **Username:** `admin`
- **Password:** `admin`

## Using Authentication Middleware

### Protecting Routes
To protect routes, use the `authenticateToken` middleware:

```javascript
const { authenticateToken, requireAdmin } = require('./auth/authMiddleware');

// Protect a single route
router.get('/protected-route', authenticateToken, controller);

// Protect all routes in a router
router.use(authenticateToken);

// Require admin role
router.delete('/admin-only', authenticateToken, requireAdmin, controller);
```

### Frontend Implementation
Store the token in localStorage and include it in requests:

```javascript
// Store token after login
localStorage.setItem('authToken', response.data.token);

// Include in API requests
const token = localStorage.getItem('authToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## Security Features

1. **JWT Tokens:** Secure, stateless authentication
2. **Token Expiration:** Tokens expire after 24 hours
3. **Role-based Access:** Admin role checking middleware
4. **Input Validation:** Proper validation of login credentials
5. **Error Handling:** Comprehensive error responses

## Future Enhancements

1. **Password Hashing:** Implement bcrypt for password security
2. **Database Storage:** Store users in database instead of in-memory
3. **Refresh Tokens:** Implement refresh token mechanism
4. **Password Reset:** Add forgot password functionality
5. **User Management:** Add user registration and management endpoints

## Testing

You can test the authentication endpoints using tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Verify token (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer TOKEN"
```
