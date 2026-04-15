# Design and Implementation Report: Social Network RESTful API

## 1. Overview
The goal of this assignment was to implement a RESTful API using Node.js, Express, and MongoDB that mimics social network functionality. The core operations revolve around user management, sending friend requests, accepting or rejecting these requests, and listing friends with advanced features such as pagination, sorting, and filtering.

## 2. Architecture and Design
The project leverages a **modular MVC-like architecture**, separating concerns into distinct logical layers:
- **Models (`/models`)**: Defines the Mongoose schemas representing the data relationships: `User`, `FriendRequest`, and `Friendship`.
- **Controllers (`/controllers`)**: Holds the core business logic. Separation into `authController.js` and `friendController.js` ensures responsibilities are naturally divided.
- **Routes (`/routes`)**: Maps incoming HTTP methods (GET, POST, PUT) to their corresponding controller functions.
- **Middleware (`/middleware`)**: Centralizes cross-cutting concerns. The `auth.js` middleware secures routes using JSON Web Tokens (JWT). An error-handling middleware in `app.js` catches all exceptions and formats them uniformly.

### Database Design
The MongoDB schema choices were made to optimize querying for relationships:
- `User`: Stores robust authentication credentials.
- `FriendRequest`: Contains `sender`, `receiver`, and a `status` payload indicating the state (`pending`, `accepted`, `rejected`).
- `Friendship`: Created exclusively when friend requests are accepted, storing associations between `user1` and `user2`.

## 3. Implementation Details & Edge Cases Handled
We treated the implementation similarly to robust real-world systems, considering potential invalid states and malicious user actions (e.g., similar to the FB API context discussed).

### A. Core Functionality 
- **Send Friend Request (`POST /friend`)**:
  - Confirms the active user's identity via JWT.
  - Generates a new `FriendRequest` with a `pending` status.
- **Respond to Friend Request (`PUT /friends-request/:id`)**:
  - Allows an `accepted` or `rejected` state update.
  - Automatically provisions a bipartite `Friendship` record upon acceptance.
- **Fetch Friends (`GET /friends`)**:
  - Resolves friendships bi-directionally (i.e., whether the user was `user1` or `user2`).
  - Processes filtering (e.g., regex on a name), sorting, and pagination logic before serializing to JSON format.
- **Fetch Received Requests (`GET /friends-request`)**:
  - Enables fetching paginated "incoming" requests securely by matching `receiver: userId`.

### B. Security & Validation Handling
Data entered by clients cannot be trusted. Validations via `Joi` intercept malformed bodies prior to execution, maintaining database integrity.
*Edge Cases Addressed:*
1. **Self-Requesting**: Users are prevented from dispatching friend requests to themselves.
2. **Idempotency Contexts**: 
   - Prevent sending duplicate friend requests if one already exists chronologically (`pending` or `accepted`).
   - Throw a 400 Bad Request error if a friend request being responded to is already processed.
3. **Authorization Breaches**: An authenticated user cannot respond to a friend request unless their User ID perfectly matches the target `receiver` ID, resolving authorization vulnerabilities.
4. **Pagination Normalization**: Assures `page` and `limit` are clamped appropriately to prevent query crash vectors.

## 4. Challenges Faced
- **Bi-Directional Querying Contexts**: In NoSQL databases, modeling an undirected graph (friend networks) can be tricky. Should friendship be modeled identically in two documents (User1 -> User2 and User2 -> User1) or one? The solution ultimately chosen was an agnostic single `Friendship` document (capturing both sides), which demands explicit projection matching ($or queries on both fields) and parsing logic within the list controller.
- **Refining Pagination while Filtering**: Querying all users inside `Friendship` populated references can limit strict native pagination using MongoDB queries exclusively. Implementing in-memory array manipulation after database retrival handles sorting and regex searches natively but faces scale limits for millions of records (a database view/index optimization is the logical scaled response to this, but the implemented approach serves initial constraints flexibly).

## 5. Lessons Learned
- **Scalable Application Sizing**: Writing modular routes paired with middleware isolates behavior neatly; future inclusions of caching frameworks or complex controllers won't convolute the file tree.
- **Anticipatory Error Catching**: Catching bugs on an API layer instead of a frontend consumer preserves database stability. Providing 40X status codes uniformly allows the frontend client to map those errors without bespoke translation functions. Extensible structures in `express` with centralized error middleware remain paramount in large-scale system designs.
