# Social Media API

## Overview

This project is a simple REST API for a social network like Facebook, Instagram.  
Users can register, login, send friend requests, accept/reject requests, and see their friends.

---

## APIs

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| POST   | /register              | Register a new user               |
| POST   | /login                 | Login user and get token          |
| POST   | /friend                | Send friend request               |
| GET    | /friends               | Get list of friends               |
| GET    | /friends-request       | Get incoming friend requests      |
| PUT    | /friends-request/:id   | Accept or reject request          |
| GET    | /friends/stats         | Get count of requests by status   |

All friend APIs require Authorization header.


---

## Features

- Pagination (page, limit)
- Search by name or email
- Sorting
- JWT authentication
- Validation and proper error handling

---

## Friend Model

Each friend request is stored in the `friends` collection.

Fields:
- requester -> user who sends request  
- recipient -> user who receives request  
- status -> pending / accepted / rejected  

Timestamps (createdAt, updatedAt) are added automatically.

By default, when a request is created, status is `pending`.

---

## Logic

- Only one request is allowed between same users (same direction)
- When listing friends:
  - check both sides (requester or recipient = logged-in user)
  - only return accepted requests
  - return the "other" user as friend

---

## Edge Cases

- Cannot send request to yourself
- Cannot send duplicate request
- Cannot send request if already friends
- If both users send request → it auto accepts
- Can resend request after rejection
- Only recipient can accept/reject request
- Cannot respond to already handled request

---

## Challenges

### 1. NODE_ENV issue on Windows

`NODE_ENV=development` was not working on Windows.

Fix: cross-env NODE_ENV=development nodemon


---

### 2. Path alias not working in VS Code

Aliases were working in code but not in VS Code (no autocomplete or navigation).

Fix:
Added `jsconfig.json` for VS Code support.

---

### 3. Search without aggregation

Friend data does not have name/email, so direct search was not possible.

Solution:
- First find users by name/email
- Then use their IDs in friend query using `$in`

---

## Note

Some unused code from the initial repo was removed to keep the project clean.