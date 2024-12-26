# Eatopia - Food Management System

## Overview
Eatopia is a comprehensive food management system API that allows users to manage food items, handle purchases, and track orders. The system provides authentication-based access control and various features for food item management.

## Base URL
```
https://eatopia-server.vercel.app
```

## API Endpoints

### Food Management

#### Add New Food
```http
POST /foods
```
Add a new food item to the system.

#### Get All Foods (Paginated)
```http
GET /foods?page={pageNumber}&size={itemsPerPage}
```
Retrieve food items with pagination support.

#### Get Total Food Count
```http
GET /count
```
Get the total number of food items in the system.

#### Get Single Food Details
```http
GET /food/:id
```
Retrieve detailed information about a specific food item.

#### Update Food Details
```http
PUT /food/:id
```
Update all details of a specific food item.

#### Update Food Quantity and Purchase Count
```http
PATCH /food/:id
```
Update the quantity and purchase count of a specific food item.

#### Get Top 6 Purchased Foods
```http
GET /limit-food
```
Retrieve the top 6 most purchased food items.

#### Search Food by Name
```http
GET /food?search={foodName}
```
Search for food items by name (case-insensitive).

### User-Specific Operations

#### Get User's Added Foods
```http
GET /my-foods?email={userEmail}
```
Retrieve all food items added by a specific user.
- Requires authentication
- Email in query must match authenticated user's email

#### Get User's Orders
```http
GET /orders?email={userEmail}
```
Retrieve all orders made by a specific user.
- Requires authentication
- Email in query must match authenticated user's email

### Purchase Management

#### Purchase Food
```http
POST /purchase-food
```
Create a new food purchase record.

#### Delete Purchase
```http
DELETE /purchase-delete/:id
```
Delete a specific purchase record.

## Authentication
- Some endpoints require authentication via JWT tokens
- Include the token in the request headers
- Unauthorized access will result in a 403 Forbidden response

## Request/Response Formats

### Food Item Structure
```javascript
{
    name: String,
    image: String,
    category: String,
    quantity: Number,
    price: Number,
    ownerName: String,
    ownerEmail: String,
    origin: String,
    desc: String,
    totalPurchase: Number
}
```

### Success Response Format
```javascript
{
    status: true,
    result: [Data]
}
```

### Error Response Format
```javascript
{
    message: "Error message"
}
```

## Status Codes
- 200: Success
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features
- JWT-based authentication
- Email verification for user-specific operations
- Protected routes for user-specific data

## Notes
- Pagination is available for the main foods endpoint
- Search functionality supports case-insensitive partial matches
- Purchase operations automatically update item quantities
- Top purchased items are sorted by total purchase count

## Technology Stack
- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT)

## Deployment
The API is deployed on Vercel and is accessible via the base URL mentioned above.

