# Social Network REST API

A RESTful API built using Node.js, Express, and MongoDB that supports user authentication and social networking features like sending and managing friend requests.

---

## Features

- User Registration & Login (JWT Authentication)
- Send Friend Request
- Accept / Reject Friend Request
- Get Friends List (Pagination, Filtering, Sorting)
- Get Incoming Friend Requests (Pagination)
- Input validation using Joi
- Security using Helmet & Rate Limiting
- Centralized error handling & logging

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (Authentication)
- Joi (Validation)
- Winston (Logging)
- Helmet & Rate Limiting (Security)

---

## Environment Variables

Create a `.env` file in root:

---

```bash
PORT=3000
DB_URI=mongodb://localhost:27017/social-network
JWT_SECRET=thisissecretkey
```

## Run Project

```bash
npm install
npm start
```

## API Documentation

### Auth APIs

- POST /api/auth/register
- Request Body:

```bash
  {
  "name": "Mohseen Khan",
  "email": "mohseen@example.com",
  "password": "123456"
  }
```

- POST /api/auth/login
- Request Body:

```bash
   {
   "email": "mohseen@example.com",
   "password": "123456"
   }

```

---

### Friend Request APIs

All below APIs require:

```bash
Authorization: Bearer <token>
```

- POST /api/friend

- Description: Send Friend Request

- Request Body:

  ```bash
  {
  "receiverId": "userId"
  }
  ```

- PATCH api/friend/request/:id

- Description: Accept / Reject Friend Request

- Request Body:

```bash
{
"action": "ACCEPT"
}

OR

{
"action": "REJECT"
}
```

- GET /api/friend

- Description: Get Friends List

- Example:

```bash
/api/friend?page=1&limit=10&name=moh&sort=asc
```

- GET api/friend/requests
- Description: Get Incoming Friend Requests

- Query Params:

```bash
page=1&limit=10
```

---

👨‍💻 Author

Mohseen Khan

---
