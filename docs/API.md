# API Documentation

## Base URLs
- REST base URL: http://localhost:5001/api
- Socket base URL: http://localhost:5001 (see docs/SOCKET_EVENTS.md)

## Content Type
- Requests and responses use JSON.
- Set Content-Type: application/json for request bodies.

## Authentication
- Protected routes require: Authorization: Bearer <JWT>
- JWTs are issued by /api/users/login, /api/users/register, and /api/users/google-login.
- JWT expiry is 30 days (see generateToken in userController).

## Rate Limits
- Global limiter for all /api routes: 500 requests per 15 minutes per IP.
- Auth limiter for /api/users/*: 5 requests per 15 minutes per IP.
- Upload limiter for /api/upload/signature: 20 requests per hour per IP.
- On limit hit, the server returns status 429 with a JSON message.

## Error Response Shape
Most errors return JSON like:

{
  "message": "Human readable error",
  "error": "Optional error details"
}

## Security Notes
- Missing token: 401 { message: "Not authorized, no token" }
- Invalid token: 401 { message: "Invalid token" }
- Expired token: 401 { message: "Token expired" }
- CORS is restricted to the allowedOrigins list in server/index.js.

## Common Status Codes
| Status | Meaning |
| --- | --- |
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation or business rule failure) |
| 401 | Unauthorized (no token / invalid token) |
| 403 | Forbidden (auth user not owner) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Server Error |

## EcoCoin (EcoSeeds) Economy Rules
- User points are stored in User.points.
- New account registration sets points to 1 (local register or Google login).
- Requesting an item checks if requester has enough points (item.ecoSeeds, default 10).
- Points are not deducted at request time. Deduction happens only after handshake verification.
- Handshake verification transfers points:
  - Requester points decrease by item.ecoSeeds (minimum 0).
  - Owner points increase by item.ecoSeeds.
  - Two Transaction records are created (spent and earned).
- Wallet purchases add points on successful payment verification.
- Item create/delete currently changes itemCount only (no points change).

## Endpoints

### Auth Routes (/api/users)

#### POST /api/users/register
- Auth: No
- Rate limit: auth limiter + global /api limiter
- Request body:
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
- Responses:
  - 201
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "token": "JWT"
    }
  - 400 { "message": "Please enter all fields" }
  - 400 { "message": "User already exists" }
  - 500 { "message": "Server Error" }
- Example cURL:
  curl -X POST http://localhost:5001/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Ava","email":"ava@example.com","password":"secret"}'
- Example fetch:
  fetch("http://localhost:5001/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ava", email: "ava@example.com", password: "secret" })
  });

#### POST /api/users/login
- Auth: No
- Rate limit: auth limiter + global /api limiter
- Request body:
  {
    "email": "string",
    "password": "string"
  }
- Responses:
  - 200
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "token": "JWT"
    }
  - 401 { "message": "Invalid email or password" }
- Example cURL:
  curl -X POST http://localhost:5001/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ava@example.com","password":"secret"}'
- Example fetch:
  fetch("http://localhost:5001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ava@example.com", password: "secret" })
  });

#### POST /api/users/google-login
- Auth: No
- Rate limit: auth limiter + global /api limiter
- Request body:
  {
    "token": "Google ID token"
  }
- Responses:
  - 200
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "token": "JWT"
    }
  - 400 { "message": "Google token is missing" }
  - 401 { "message": "Invalid Google token" }
- Example cURL:
  curl -X POST http://localhost:5001/api/users/google-login \
    -H "Content-Type: application/json" \
    -d '{"token":"GOOGLE_ID_TOKEN"}'
- Example fetch:
  fetch("http://localhost:5001/api/users/google-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "GOOGLE_ID_TOKEN" })
  });

#### GET /api/users/profile
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Response:
  - 200
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "points": 10,
      "itemCount": 2,
      "items": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "category": "string",
          "imageUrl": "string",
          "address": "string",
          "ecoSeeds": 10,
          "location": { "type": "Point", "coordinates": [77.6, 12.9] },
          "status": "available",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  - 404 { "message": "User not found" }
- Example cURL:
  curl http://localhost:5001/api/users/profile \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/users/profile", {
    headers: { Authorization: "Bearer <JWT>" }
  });

### Item Routes (/api/items)

#### GET /api/items
- Auth: No
- Rate limit: global /api limiter
- Query params:
  - keyword (string, optional)
  - category (string, optional)
  - lat (number, optional)
  - lng (number, optional)
  - radius (number, km, optional)
  - page (number, optional, default 1)
- Response:
  - 200
    {
      "items": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "category": "string",
          "imageUrl": "string",
          "address": "string",
          "ecoSeeds": 10,
          "location": { "type": "Point", "coordinates": [77.6, 12.9] },
          "status": "available",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "page": 1,
      "pages": 3,
      "total": 25
    }
- Example cURL:
  curl "http://localhost:5001/api/items?keyword=chair&lat=12.9&lng=77.6&radius=5&page=1"
- Example fetch:
  fetch("http://localhost:5001/api/items?keyword=chair&lat=12.9&lng=77.6&radius=5&page=1");

#### POST /api/items
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "imageUrl": "string",
    "address": "string",
    "ecoSeeds": 10,
    "location": [77.6, 12.9]
  }
  - location is [lng, lat]
  - ecoSeeds is optional (default 10)
- Response:
  - 201 (created item)
- Example cURL:
  curl -X POST http://localhost:5001/api/items \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"name":"Chair","description":"Good condition","category":"Furniture","imageUrl":"https://...","address":"12 Main St","ecoSeeds":10,"location":[77.6,12.9]}'
- Example fetch:
  fetch("http://localhost:5001/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ name: "Chair", description: "Good condition", category: "Furniture", imageUrl: "https://...", address: "12 Main St", ecoSeeds: 10, location: [77.6, 12.9] })
  });

#### GET /api/items/:id
- Auth: No
- Rate limit: global /api limiter
- Response:
  - 200 (item object)
  - 404 { "message": "Item not found" }
- Example cURL:
  curl http://localhost:5001/api/items/ITEM_ID
- Example fetch:
  fetch("http://localhost:5001/api/items/ITEM_ID");

#### DELETE /api/items/:id
- Auth: Yes (Bearer token, item owner only)
- Rate limit: global /api limiter
- Response:
  - 200 { "message": "Item removed successfully" }
  - 403 { "message": "Not authorized to delete this item" }
  - 404 { "message": "Item not found" }
- Example cURL:
  curl -X DELETE http://localhost:5001/api/items/ITEM_ID \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/items/ITEM_ID", {
    method: "DELETE",
    headers: { Authorization: "Bearer <JWT>" }
  });

#### GET /api/items/:id/reviews
- Auth: No
- Rate limit: global /api limiter
- Response:
  - 200
    {
      "reviews": [
        {
          "_id": "string",
          "user": "string",
          "name": "string",
          "rating": 4,
          "comment": "string",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "numReviews": 1,
      "averageRating": 4
    }
  - 404 { "message": "Item not found" }
- Example cURL:
  curl http://localhost:5001/api/items/ITEM_ID/reviews
- Example fetch:
  fetch("http://localhost:5001/api/items/ITEM_ID/reviews");

#### POST /api/items/:id/reviews
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "rating": 1,
    "comment": "string"
  }
- Responses:
  - 201 { "message": "Review added", "reviews": [], "averageRating": 0, "numReviews": 0 }
  - 400 { "message": "You cannot review your own item" }
  - 400 { "message": "You have already reviewed this item" }
  - 404 { "message": "Item not found" }
- Example cURL:
  curl -X POST http://localhost:5001/api/items/ITEM_ID/reviews \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"rating":5,"comment":"Great"}'
- Example fetch:
  fetch("http://localhost:5001/api/items/ITEM_ID/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ rating: 5, comment: "Great" })
  });

#### DELETE /api/items/:itemId/reviews/:reviewId
- Auth: Yes (Bearer token, item owner or review author)
- Rate limit: global /api limiter
- Response:
  - 200 { "message": "Review deleted successfully", "averageRating": 0, "numReviews": 0 }
  - 401 { "message": "Not authorized to delete this review." }
  - 404 { "message": "Item not found" }
  - 404 { "message": "Review not found" }
- Example cURL:
  curl -X DELETE http://localhost:5001/api/items/ITEM_ID/reviews/REVIEW_ID \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/items/ITEM_ID/reviews/REVIEW_ID", {
    method: "DELETE",
    headers: { Authorization: "Bearer <JWT>" }
  });

### Request Routes (/api/requests)

#### POST /api/requests
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "itemId": "string"
  }
- Responses:
  - 201 (created request)
  - 400 { "message": "You cannot request your own item" }
  - 400 { "message": "Insufficient EcoSeeds. You need <n> EcoSeeds to request this item." }
  - 400 { "message": "You have already requested this item" }
  - 404 { "message": "Item not found" }
- Example cURL:
  curl -X POST http://localhost:5001/api/requests \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"itemId":"ITEM_ID"}'
- Example fetch:
  fetch("http://localhost:5001/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ itemId: "ITEM_ID" })
  });

#### GET /api/requests/sent
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Response:
  - 200
    [
      {
        "_id": "string",
        "item": { "_id": "string", "name": "string", "imageUrl": "string" },
        "owner": { "_id": "string", "name": "string" },
        "status": "Pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
- Example cURL:
  curl http://localhost:5001/api/requests/sent \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/requests/sent", {
    headers: { Authorization: "Bearer <JWT>" }
  });

#### GET /api/requests/received
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Response:
  - 200
    [
      {
        "_id": "string",
        "item": { "_id": "string", "name": "string", "imageUrl": "string" },
        "requester": { "_id": "string", "name": "string" },
        "status": "Pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
- Example cURL:
  curl http://localhost:5001/api/requests/received \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/requests/received", {
    headers: { Authorization: "Bearer <JWT>" }
  });

#### PUT /api/requests/:id
- Auth: Yes (Bearer token, owner only)
- Rate limit: global /api limiter
- Request body:
  {
    "status": "Pending | Accepted | Declined | Completed"
  }
- Responses:
  - 200 (updated request)
  - 401 { "message": "Not authorized to update this request" }
  - 404 { "message": "Request not found" }
- Example cURL:
  curl -X PUT http://localhost:5001/api/requests/REQUEST_ID \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"status":"Accepted"}'
- Example fetch:
  fetch("http://localhost:5001/api/requests/REQUEST_ID", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ status: "Accepted" })
  });

#### POST /api/requests/:id/verify
- Auth: Yes (Bearer token, owner only)
- Rate limit: global /api limiter
- Responses:
  - 200
    {
      "message": "Handshake successful, points awarded!",
      "request": { "_id": "string", "status": "Completed" }
    }
  - 400 { "message": "Only accepted requests can be verified" }
  - 401 { "message": "Not authorized to verify this request" }
  - 404 { "message": "Request not found" }
- Example cURL:
  curl -X POST http://localhost:5001/api/requests/REQUEST_ID/verify \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/requests/REQUEST_ID/verify", {
    method: "POST",
    headers: { Authorization: "Bearer <JWT>" }
  });

### Chat Routes (/api/chat)

#### POST /api/chat/start
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "itemId": "string"
  }
- Response:
  - 201 (chat object)
  - 200 (existing chat object)
- Example cURL:
  curl -X POST http://localhost:5001/api/chat/start \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"itemId":"ITEM_ID"}'
- Example fetch:
  fetch("http://localhost:5001/api/chat/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ itemId: "ITEM_ID" })
  });

#### GET /api/chat/:chatId/messages
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Response:
  - 200
    [
      {
        "_id": "string",
        "chat": "string",
        "sender": { "_id": "string", "name": "string" },
        "text": "string",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
- Example cURL:
  curl http://localhost:5001/api/chat/CHAT_ID/messages \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/chat/CHAT_ID/messages", {
    headers: { Authorization: "Bearer <JWT>" }
  });

#### POST /api/chat/:chatId/messages
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "text": "string"
  }
- Response:
  - 201 (message object)
- Example cURL:
  curl -X POST http://localhost:5001/api/chat/CHAT_ID/messages \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"text":"Hello"}'
- Example fetch:
  fetch("http://localhost:5001/api/chat/CHAT_ID/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ text: "Hello" })
  });

### Leaderboard Routes (/api/leaderboard)

#### GET /api/leaderboard
- Auth: No
- Rate limit: global /api limiter
- Response:
  - 200
    [
      { "rank": 1, "name": "Ava", "itemCount": 5, "points": 40 }
    ]
- Example cURL:
  curl http://localhost:5001/api/leaderboard
- Example fetch:
  fetch("http://localhost:5001/api/leaderboard");

### Upload Routes (/api/upload)

#### GET /api/upload/signature
- Auth: Yes (Bearer token)
- Rate limit: strict upload limiter + global /api limiter
- Response:
  - 200
    {
      "signature": "string",
      "timestamp": 1710000000,
      "apiKey": "string",
      "cloudName": "string"
    }
  - 500 { "message": "Failed to generate upload signature" }
- Example cURL:
  curl http://localhost:5001/api/upload/signature \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/upload/signature", {
    headers: { Authorization: "Bearer <JWT>" }
  });

### Wallet Routes (/api/wallet)

#### GET /api/wallet/transactions
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Response:
  - 200
    [
      {
        "_id": "string",
        "type": "earned",
        "amount": 10,
        "description": "string",
        "relatedItem": { "_id": "string", "name": "string" },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
- Example cURL:
  curl http://localhost:5001/api/wallet/transactions \
    -H "Authorization: Bearer <JWT>"
- Example fetch:
  fetch("http://localhost:5001/api/wallet/transactions", {
    headers: { Authorization: "Bearer <JWT>" }
  });

#### POST /api/wallet/create-order
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "amount": 499,
    "seeds": 50
  }
- Response:
  - 200 (Razorpay order object plus seeds)
  - 500 { "message": "Server Error" }
- Notes:
  - amount is multiplied by 100 on the server (INR paise).
  - If RAZORPAY_KEY_ID is missing, a mock order is returned.
- Example cURL:
  curl -X POST http://localhost:5001/api/wallet/create-order \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"amount":499,"seeds":50}'
- Example fetch:
  fetch("http://localhost:5001/api/wallet/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ amount: 499, seeds: 50 })
  });

#### POST /api/wallet/verify-payment
- Auth: Yes (Bearer token)
- Rate limit: global /api limiter
- Request body:
  {
    "razorpay_order_id": "string",
    "razorpay_payment_id": "string",
    "razorpay_signature": "string",
    "seeds": 50
  }
- Responses:
  - 200
    {
      "message": "Payment verified successfully",
      "transaction": { "_id": "string", "type": "purchased", "amount": 50 },
      "newBalance": 100
    }
  - 400 { "message": "Invalid Signature" }
- Example cURL:
  curl -X POST http://localhost:5001/api/wallet/verify-payment \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"razorpay_order_id":"order_123","razorpay_payment_id":"pay_123","razorpay_signature":"sig_123","seeds":50}'
- Example fetch:
  fetch("http://localhost:5001/api/wallet/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer <JWT>" },
    body: JSON.stringify({ razorpay_order_id: "order_123", razorpay_payment_id: "pay_123", razorpay_signature: "sig_123", seeds: 50 })
  });
