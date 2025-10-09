# Social Network API

Quick start:

1. Copy `.env.example` to `.env` and set MONGO_URI and JWT_SECRET.
2. npm install
3. npm run dev
4. API endpoints begin with /api

Auth:
- POST /api/register { name, email, password }
- POST /api/login { email, password } -> returns token

Friends:
- GET /api/friends?name=foo&sort=name:asc&page=1&limit=10  // list friends of logged in user
- POST /api/friend { to, message } // send friend request
- GET /api/friends-request?type=incoming|outgoing&status=pending&page=1&limit=10&sort=createdAt:desc
- PUT /api/friends-request/:id { action: 'accept' | 'reject' }

Use Authorization: Bearer <token> header for protected routes.
