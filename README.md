# Article Management System 

This is a full-stack application for managing articles, built with React, Node.js, Express, MongoDB, and TypeScript.

## Features

- User Authentication (Registration, Login) with JWT.
- CRUD operations for Articles.
- CRUD operations for Comments on articles.
- Protected routes for authenticated users.
- State management with Context API.
- Client-side routing with React Router v6.

## Tech Stack

**Frontend:**
- React
- TypeScript
- Material-UI (MUI)
- Context API
- React Router v6

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT) for authentication

## Project Structure

```
praktika5/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── react-app-env.d.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Installation Steps

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn
- MongoDB (local instance or a cloud service like MongoDB Atlas)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Create a `.env` file** in the `backend` directory by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  **Update the environment variables** in the `.env` file (see [Backend Environment Variables](#backend-environment-variables)).
5.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The backend server will typically start on `http://localhost:5000` (or the port specified in your `.env`).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Create a `.env` file** in the `frontend` directory by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  **Update the environment variables** in the `.env` file (see [Frontend Environment Variables](#frontend-environment-variables)).
5.  **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The frontend development server will typically start on `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

```env
# Port for the backend server
PORT=5000

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/article-management

# JWT Secret Key
JWT_SECRET=yourjwtsecretkey

# JWT Token Expiration (e.g., 1h, 7d)
JWT_EXPIRES_IN=1h
```

### Frontend (`frontend/.env`)

```env
# URL of the backend API
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

Base URL: `/api`

### Authentication

-   **`POST /auth/register`**: Register a new user.
    -   Request Body: `{ "email": "user@example.com", "password": "password123", "confirmPassword": "password123" }`
    -   Response: `{ "token": "jwt_token", "user": { "id": "...". "email": "..." } }` (on success)
-   **`POST /auth/login`**: Log in an existing user.
    -   Request Body: `{ "email": "user@example.com", "password": "password123" }`
    -   Response: `{ "token": "jwt_token", "user": { "id": "...". "email": "..." } }` (on success)

### Articles

*Authentication Required for POST, PUT, DELETE*

-   **`GET /articles`**: Get a list of all articles (with author info). Supports pagination (`?page=1&limit=10`).
    -   Response: `{ "articles": [...], "currentPage": 1, "totalPages": 5, "totalArticles": 50 }`
-   **`POST /articles`**: Create a new article.
    -   Request Body: `{ "title": "New Article Title", "content": "Article content here..." }`
    -   Response: `{ "_id": "...", "title": "...", "content": "...", "author": "...", "comments": [], ... }`
-   **`GET /articles/:id`**: Get a single article by ID (with comments).
    -   Response: `{ "_id": "...", "title": "...", "content": "...", "author": { ... }, "comments": [{ ... }], ... }`
-   **`PUT /articles/:id`**: Update an existing article (only by the author).
    -   Request Body: `{ "title": "Updated Title", "content": "Updated content..." }`
    -   Response: Updated article object.
-   **`DELETE /articles/:id`**: Delete an article (only by the author).
    -   Response: `{ "message": "Article deleted successfully" }`

### Comments

*Authentication Required for POST, PUT, DELETE*

-   **`POST /comments`**: Add a new comment to an article.
    -   Request Body: `{ "text": "This is a comment.", "articleId": "article_id_here" }`
    -   Response: `{ "_id": "...", "text": "...", "article": "...", "author": "...", ... }`
-   **`PUT /comments/:id`**: Update an existing comment (only by the author).
    -   Request Body: `{ "text": "Updated comment text." }`
    -   Response: Updated comment object.
-   **`DELETE /comments/:id`**: Delete a comment (only by the author).
    -   Response: `{ "message": "Comment deleted successfully" }`

## Error Handling

-   **Form Validation**: Frontend forms will display specific error messages for invalid inputs (e.g., "Email is required", "Password must be at least 6 characters").
-   **API Error Responses**: The backend API will return appropriate HTTP status codes and JSON error messages:
    -   `400 Bad Request`: Invalid input, missing fields.
    -   `401 Unauthorized`: Missing or invalid JWT token.
    -   `403 Forbidden`: User not authorized to perform the action.
    -   `404 Not Found`: Resource not found.
    -   `500 Internal Server Error`: Server-side errors.
    Example error response:
    ```json
    {
      "message": "Validation Error",
      "errors": [
        { "field": "email", "message": "Email is already taken" }
      ]
    }
    ```

## Authentication Flow

1.  User registers or logs in via `AuthForm`.
2.  On successful authentication, the backend returns a JWT.
3.  The frontend stores the JWT in `localStorage`.
4.  For subsequent API requests to protected routes, the JWT is included in the `Authorization` header (e.g., `Authorization: Bearer <token>`).
5.  The backend verifies the JWT using middleware.
6.  If the token is invalid or expired, or if the user tries to access a protected route without a token, they are redirected to the login page.
7.  The `Navbar` component updates to show user status (e.g., display username, logout button).

## Testing Instructions

### Sample User Credentials

-   After registration, use the credentials you created.
-   For initial testing, you can register a user like:
    -   Email: `testuser@example.com`
    -   Password: `password123`

### Example API Calls (using cURL or Postman)

*Replace `YOUR_JWT_TOKEN` with the actual token obtained after login.*
*Replace `:articleId` and `:commentId` with actual IDs.*

**1. Register User:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123"}' http://localhost:5000/api/auth/register
```

**2. Login User:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' http://localhost:5000/api/auth/login
```

**3. Create Article (Authenticated):**
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"title":"My First Article","content":"This is the content of my first article."}' http://localhost:5000/api/articles
```

**4. Get All Articles:**
```bash
curl -X GET http://localhost:5000/api/articles
```

**5. Get Single Article (e.g., ID: 60c72b2f9b1e8b001c8e4d8e):**
```bash
curl -X GET http://localhost:5000/api/articles/60c72b2f9b1e8b001c8e4d8e
```

**6. Add Comment to Article (Authenticated):**
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"text":"Great article!","articleId":"60c72b2f9b1e8b001c8e4d8e"}' http://localhost:5000/api/comments
```

## Additional Notes

-   Modern TypeScript practices (interfaces, types, generics) are used throughout the project.
-   Proper type guards are implemented where necessary.
-   MUI's `styled` API or `sx` prop is used for custom styling.
-   REST API best practices are followed.
-   Pagination is implemented for the articles list.
-   Loading skeletons/indicators are used for a better User Experience (UX) during data fetching.
