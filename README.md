# Payment API

A NestJS-based payment API that handles transactions between users with proper state management.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Database Setup

```sql
-- Create database
CREATE DATABASE payment_db;

-- Connect to database
\c payment_db

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    origin_id INTEGER REFERENCES users(id),
    destination_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_amount CHECK (amount > 0)
);
```

## Environment Configuration

Create a `.env` file in the project root:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=payment_db
```

## Running the Application

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Transaction Management

#### Approve Transaction
```http
PATCH /transactions/{id}/approve
```
- Approves a pending transaction
- Returns 400 if transaction is not in PENDING state
- Returns 404 if transaction not found

Example:
```bash
curl -X PATCH http://localhost:3000/transactions/1/approve
```

#### Reject Transaction
```http
PATCH /transactions/{id}/reject
```
- Rejects a pending transaction
- Returns 400 if transaction is not in PENDING state
- Returns 404 if transaction not found

Example:
```bash
curl -X PATCH http://localhost:3000/transactions/1/reject
```

## Transaction States

- `PENDING`: Initial state of a transaction
- `COMPLETED`: Transaction has been approved and processed
- `FAILED`: Transaction has been rejected

## Security Features

- Pessimistic locking for concurrent transaction handling
- Balance validation before transaction approval
- Database transaction atomicity

## Project Structure

```
payment-api/
├── src/
│   ├── entities/
│   │   ├── transaction.entity.ts
│   │   └── user.entity.ts
│   ├── transactions/
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   └── transactions.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
└── README.md
```

## License

[MIT licensed](LICENSE)

## API Documentation

### Swagger UI
The API documentation is available through Swagger UI at:
```
http://localhost:3000/api
```

### Postman Collection
A Postman collection is included in the root directory (`postman_collection.json`). To use it:
1. Open Postman
2. Click on "Import"
3. Select the `postman_collection.json` file
4. The collection will be imported with all endpoints and example responses
