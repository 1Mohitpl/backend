# TrackYourSubscription - Backend API

Node.js/Express REST API for the TrackYourSubscription application.

## Features

- ✅ User authentication (JWT)
- ✅ CRUD operations for subscriptions
- ✅ MongoDB database
- ✅ Input validation
- ✅ Password hashing
- ✅ Subscription statistics and insights
- ✅ RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/trackyoursubscription
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Subscriptions

- `GET /api/subscriptions` - Get all user subscriptions
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/subscriptions/stats/overview` - Get statistics

### Health Check

- `GET /api/health` - API health check

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Netflix",
    "cost": 15.99,
    "billingCycle": "monthly",
    "category": "entertainment",
    "renewalDate": "2024-03-01",
    "color": "#e50914"
  }'
```

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Subscription
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  cost: Number,
  billingCycle: String (monthly/yearly),
  renewalDate: Date,
  category: String,
  color: String,
  isActive: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS enabled
- Protected routes with middleware

## Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```
