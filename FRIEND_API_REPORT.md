# Social Network Friend API — Design Report

## Overview
This document describes the design and implementation of the friend-management
feature added to the existing Node.js / Express / MongoDB project. The feature
implements four operations defined by the task: **send a friend request**,
**accept/reject a friend request**, **list friends**, and **list incoming
friend requests with pagination**.

The implementation follows the existing project architecture
(routes → validation → controller → service → model), naming conventions,
module-resolver aliases, and error-handling patterns. No new architecture was
introduced.

## API Endpoints
All endpoints require a valid JWT access token (`Authorization: Bearer <token>`),
obtained via the existing `POST /auth/register` and `POST /auth/login` APIs.

| Method | Path                   | Description                                  |
|--------|------------------------|----------------------------------------------|
| POST   | `/friend`              | Send a friend request to a user              |
| PUT    | `/friends-request/:id` | Accept or reject a received friend request   |
| GET    | `/friends`             | List the authenticated user's friends        |
| GET    | `/friends-request`     | List incoming (pending) requests, paginated  |

### Request / response details
- **POST `/friend`** — body `{ "recipientId": "<userId>" }`. Returns `201` with
  the created friend request.
- **PUT `/friends-request/:id`** — body `{ "action": "accept" | "reject" }`.
  Returns `200` with the updated request.
- **GET `/friends`** — returns `200` with the list of friend users
  (`name`, `email`, `id`).
- **GET `/friends-request`** — query `page`, `limit`, `sortBy`. Returns the
  `mongoose-paginate-v2` result (`results`, `totalResults`, `page`, `limit`,
  `totalPages`).

## Data Model
A single `FriendRequest` collection models the relationship:

| Field       | Type                    | Notes                                          |
|-------------|-------------------------|------------------------------------------------|
| `requester` | ObjectId → User         | Required. User who sent the request.           |
| `recipient` | ObjectId → User         | Required. User who received the request.       |
| `status`    | enum                    | `pending` (default) / `accepted` / `rejected`. |
| timestamps  | Date                    | `createdAt` / `updatedAt`.                      |

An **accepted** request is the single source of truth for a friendship, so no
separate `friends` collection is needed. A unique compound index on
`{ requester, recipient }` prevents duplicate requests for the same ordered pair.
The `status` values are centralised in `models/enum.model.js`
(`EnumFriendRequestStatus`) to match the existing enum pattern.

## Layered Implementation
- **`routes/friend/friend.route.js`** — defines the four routes, each guarded by
  `auth()` and the matching Joi `validate(...)` middleware.
- **`validations/friend/friend.validation.js`** — Joi schemas validating body,
  route params, and query params with meaningful messages
  (`recipientId`/`:id` validated as Mongo ObjectIds via `joi-objectid`,
  `action` restricted to `accept`/`reject`, pagination numbers bounded).
- **`controllers/friend/friend.controller.js`** — thin handlers wrapped in
  `catchAsync`; they pull the authenticated user from `req.user`, delegate to the
  service, and shape the HTTP response.
- **`services/friend.service.js`** — all business rules and DB access.
- **`models/friend.model.js`** — the `FriendRequest` schema with the `toJSON`
  and `mongoose-paginate-v2` plugins, consistent with `user.model.js`.

## Edge Cases Handled
- Sending a request to **yourself** → `400`.
- **Recipient does not exist** → `404`.
- **Duplicate** pending request (either direction) → `400`.
- Request to a user you are **already friends** with → `400`.
- A previously **rejected** pair can send a fresh request (the record is reopened
  as pending).
- Responding to a request you did **not receive** → `403`.
- Responding to a request that is **not pending** (already accepted/rejected) → `400`.
- Invalid ObjectIds / invalid `action` / invalid pagination values → `400` via Joi.

## Error Handling
Services throw `ApiError(statusCode, message)`. The existing `errorConverter` and
`errorHandler` middleware translate these into consistent JSON responses
(`{ error, code, message }`). Async errors are funnelled through `catchAsync`.

## Wiring / Integration Notes
While integrating, I fixed pre-existing broken wiring so the feature (and the
rest of the API) boots correctly:
- `routes/index.js` referenced an undefined `friendRoute` and never mounted its
  imported routers — rewritten to mount `/auth` and the friend routes.
- `app.js` imported a non-existent route file and had the main router commented
  out — repointed to the central `routes` module.
- The original `friend.model.js`, `friend.controller.js`, and route file were
  placeholder stubs (incorrect schema, reversed `ApiError(message, code)`
  argument order, no service/validation/auth) and were replaced with the
  implementation above.

The duplicate, empty friend stubs generated under the `user` module
(`controllers/user/user.controller.js`, `validations/user/user.validation.js`,
`routes/user/user/user.route.js`) were left untouched but are **not mounted**, so
there are no dead or conflicting endpoints.

## Challenges & Lessons Learned
- **Modelling friendships** with a single directional request document (plus a
  bidirectional duplicate check) keeps the schema simple while still supporting
  request lifecycle and friend listing.
- **Existing repo state**: the scaffolding contained conflicting placeholder
  implementations across two modules and broken router wiring; the main effort
  was understanding the conventions and integrating cleanly without breaking the
  existing auth flow.
- **Environment note**: the repository pins very old dependencies
  (`jsonwebtoken@8`, `passport-jwt@4`) that rely on Node's removed `SlowBuffer`
  API, so the server does not boot under Node 26 (the version available in this
  environment). This is unrelated to the friend feature — every layer was
  verified to compile via Babel, and the model, services, and validation schemas
  were exercised in isolation. Running on the project's supported Node (>=12, e.g.
  Node 16/18) with a local MongoDB allows the full API to run.
