Social Network REST API – Report & API Documentation

1. Introduction
    This project is a RESTful backend developed using Node.js, Express.js, and MongoDB. The goal is to build a social-network-style API that supports:
        User Registration & Login
        Sending Friend Requests
        Accepting / Rejecting Friend Requests
        Listing Friends with Pagination, Sorting & Filtering
        Listing Incoming Friend Requests with Pagination
        Input validation

    The system follows a modular folder structure and uses JWT for authentication and Joi for validation.


2. System Architecture

| Component      | Technology         |
| -------------- | ------------------ |
| Runtime        | Node.js            |
| Framework      | Express.js         |
| Database       | MongoDB (Mongoose) |
| Validation     | Joi                |
| Auth           | JWT                |


3. Folder Structure

src/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── validators/
 ├── middlewares/
 ├── utils/
 └── db/


4. Features Implemented

| Feature             | Description                                  |
| ------------------- | -------------------------------------------- |
| User Registration   | Saves user data securely & hashes passwords  |
| User Login          | Validates credentials & returns JWT          |
| Auth Middleware     | Validates user token for protected routes    |
| Send Friend Request | Prevents duplicate & self requests           |
| Accept / Reject     | Only receiver can respond                    |
| List Friends        | Supports pagination, filter by name, sorting |
| Incoming Requests   | Shows pending requests with pagination       |
| Validation          | Joi input validation                         |


5. Use Cases Friends Controller

    No self friend request allowed

    Prevent duplicate requests between same users

    Cannot accept/reject already processed request

    Only receiver can respond to a request

    Pagination defaults used if missing and sorting

    Validations for missing or invalid fields 


6. API Endpoints & Sample Requests

    Starting API Endpoint: http://localhost:5000/api/
    
    a. Register User
    POST /register

    Request:
        {
            "name":"saroj panigrahi",
            "email":"saroj12@gmail.com",
            "password":"Saroj123!"
        }

    Response:
        {
            "success": true,
            "message": "User registered successfully"
        }

    ------------------------------------------------------------------
    b. Login User

    POST /login

    Request:

        {
            "email":"saroj12@gmail.com",
            "password":"Saroj123!"
        }

    Response:
        {
            "success": true,
            "message": "Login successful",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDliMGY0ZDE3NDVmOTllNTlmNGIwNCIsImVtYWlsIjoiaml0MTJAZ21haWwuY29tIiwiaWF0IjoxNzYyMjQ0ODY1LCJleHAiOjE3NjIzMzEyNjV9.EQjEzFStf09RBOY_p12KKsmG27v9G6izG7dIp6fRalE"
        }

    ------------------------------------------------------------------
    c. Send Friend Request

    POST: /friend

    Headers:
        Authorization: eyJhbGciOiJIUzI1NiIsIn......
        
    Request:

        {
            "toUserId":"6909b0f4d1745f99e59f4b04"
        }

    Response:

        {
            "success": true,
            "message": "Friend request sent successfully"
        }

    ------------------------------------------------------------------
    D. Respond to Friend Request

    PUT: /friends-request/:requestId

    Headers:
        Authorization: eyJhbGciOiJIUzI1NiIsIn......

    Request:

    {
        "action":"accept"
    }

    Response:

    {
        "success": true,
        "message": "Friend request accepted successfully"
    }

    ------------------------------------------------------------------
    E. List Friends

    GET: /friends

    Headers:
        Authorization: eyJhbGciOiJIUzI1NiIsIn......

    Response:

    {
        "success": true,
        "total": 3,
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "friends": [
            {
                "_id": "6909b0f4d1745f99e59f4b04",
                "name": "jit",
                "email": "jit12@gmail.com"
            },
            {
                "_id": "6909b159d1745f99e59f4b07",
                "name": "mark",
                "email": "mark12@gmail.com"
            },
            {
                "_id": "6909a5507bd0e25f2b5a60c4",
                "name": "saroj panigrahi",
                "email": "saroj12@gmail.com"
            }
        ]
    }

    ------------------------------------------------------------------
    F. List Incoming Friend Requests Which is pending

    GET: friends-request

    Headers:
        Authorization: eyJhbGciOiJIUzI1NiIsIn......


    Response:
    
    {
        "success": true,
        "total": 3,
        "page": 3,
        "limit": 1,
        "totalPages": 3,
        "requests": [
            {
                "_id": "6909b26d9e2639d7db525ddc",
                "from": {
                    "_id": "6909a5507bd0e25f2b5a60c4",
                    "name": "saroj panigrahi",
                    "email": "saroj12@gmail.com"
                },
                "to": "6909b0f4d1745f99e59f4b04",
                "status": "pending",
                "createdAt": "2025-11-04T07:59:41.858Z",
                "updatedAt": "2025-11-04T08:11:44.570Z",
                "__v": 0
            }
        ]
    }

    ------------------------------------------------------------------

7. Challenges
    
    Handling friend request logic
