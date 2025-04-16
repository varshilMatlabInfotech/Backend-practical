Social Network API

============================================================
============================================================

Modular Architecture and Design
-------------------------------
Routes – Handle HTTP endpoints.

Controllers – Contain business logic for each operation.

Models – Mongoose schemas for User and FriendRequest.

Middleware – Includes authentication and request validation.

Utils – response.js is used for consistent API responses.

Authentication is implemented using JWT (JSON Web Token). 

Passwords are hashed securely using bcrypt.

============================================================
============================================================

APIS
----
POST /register – Register a new user (with unique email).

POST /login – Authenticate user and return JWT token.

POST /friend – Send a friend request.

GET /friends-request – List all incoming friend requests (with pagination).

PUT /friends-request/:id – Accept or reject a friend request.

GET /friends – List all friends (with pagination, filtering, and sorting).


============================================================
============================================================

Lessons Learned
---------------
Use of Joi request validator

Using a centralized response handler improves consistency across all API responses.

============================================================
============================================================