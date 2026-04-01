# Assignment Report - Social Network API

## Overview

In this assignment, I built a social network API using Node.js, Express, and MongoDB.  
The main goal was to complete friend request features with proper validation and error handling.

Required APIs implemented:

- `POST /register` 
- `POST /login`
- `POST /friend`
- `GET /friends`
- `GET /friends-request`
- `PUT /friends-request/:id`

## Design and Implementation

The project is divided into routes, validations, controllers, models, and middleware.  
This made the code easy to manage and debug.

Friend flow works like this:

1. User sends request using `POST /friend`
2. Receiver checks requests using `GET /friends-request`
3. Receiver accepts/rejects using `PUT /friends-request/:id`
4. Accepted users are shown in `GET /friends`

User data is stored in MongoDB.  
For friend logic, arrays are used in user model:

- `friends`
- `incomingFriendRequests`
- `outgoingFriendRequests`

`GET /friends` supports pagination, name filtering, and sorting.

## Validation and Error Handling

Validation is added for body, params, and query using Joi.  
Examples:

- required fields (`friendId`, `action`)
- valid ObjectId format
- valid action values (`accept`, `reject`)
- pagination limits

Errors are handled through common middleware, so API responses are clear and consistent.

## Challenges Faced

- The project already had base code, so I had to fit new logic into existing structure.
- There was confusion between all users vs only friends in friend-list API.
- Some response messages were static, so I updated them to include user names.

## Lessons Learned

- Clear request/response format is very important.
- Good validation saves a lot of debugging time.
- Modular code structure helps in fast changes.
- Friend request features are easier when treated as state changes (pending -> accepted/rejected).

## Testing and environment

I created my own `.env` file locally (based on `example.env`) with MongoDB URL, JWT secret, and port settings for my machine. I tested all the required APIs end to end: registration and login, sending friend requests, listing incoming requests, accepting or rejecting, and listing friends. Data was saving correctly in MongoDB and the flows behaved as expected.

## Conclusion

The required APIs are implemented and working with authentication, validation, and error handling.  
The assignment helped improve practical backend skills in API design and database updates for social network features.
