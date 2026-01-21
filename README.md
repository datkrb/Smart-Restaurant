# Smart Restaurant – QR Menu Ordering System

## 1. System Overview

Smart Restaurant is a QR-based menu ordering system for dine-in service that helps restaurants digitize menus, streamline ordering, and manage kitchen workflows efficiently.

Key capabilities:

- Digital menu management with categories, items, and modifiers
- QR code generation for each table
- Customers scan QR codes to browse menu and place orders
- Single active order per table session (pay-after-meal model)
- Real-time order tracking via Kitchen Display System (KDS)
- Integrated payment gateway (Stripe / VNPay / MoMo / ZaloPay)
- Revenue reports and analytics

> **Scope note:** This is a **single-restaurant system**. Multi-tenant support is not included.

---

## 2. Technology Stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| Architecture   | Single Page Application (SPA)               |
| Frontend       | ReactJS / NextJS                            |
| Backend        | NodeJS (Express)                            |
| Database       | PostgreSQL / MySQL (via Prisma ORM)         |
| Authentication | Passport.js + JWT                           |
| Real-time      | Socket.IO / WebSocket                       |
| Payment        | Stripe (extensible to VNPay, MoMo, ZaloPay) |
| Caching        | Redis (optional)                            |
| Deployment     | Docker, Public Hosting                      |

---

## 3. User Roles

| Role          | Description                                               |
| ------------- | --------------------------------------------------------- |
| Guest         | Customer scanning QR code to browse menu and place orders |
| Customer      | Registered user with order history and profile            |
| Super Admin   | System-level administrator managing Admin accounts        |
| Admin         | Restaurant owner with full management permissions         |
| Waiter        | Accepts orders, manages table service                     |
| Kitchen Staff | Uses KDS to prepare orders                                |

---

## 4. Key User Flows

### 4.1 Restaurant Setup (Admin)

Super Admin → Create Admin → Admin Login → Menu Creation → Table Setup → QR Code Generation

### 4.2 Customer Registration

Sign Up → Email Verification → Login → Access Order History

### 4.3 Customer Ordering (Dine-in Only)

Scan QR → View Menu → Add to Cart → Customize with Modifiers → Submit Items → Track Order → Add More Items → Request Bill → Payment

> Customers can add more items to their **current unpaid order** at any time. All items belong to **one order per table session**.

### 4.4 Waiter Order Acceptance

Customer Places Order → Waiter Receives Notification → Review → Accept/Reject → Send to Kitchen

### 4.5 Order Processing (Kitchen)

Received → Preparing → Ready → Served → Completed

---

## 5. Database Design (ERD)

### 5.1 Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER {
        string id
        string email
        string password
        string fullName
        string avatarUrl
        string role
        boolean isActive
    }

    RESTAURANT {
        string id
        string name
        string address
    }

    TABLE {
        string id
        string restaurantId
        string name
        int capacity
        boolean isActive
    }

    TABLE_SESSION {
        string id
        string tableId
        datetime startedAt
        datetime endedAt
        string status
    }

    CATEGORY {
        string id
        string restaurantId
        string name
    }

    MENU_ITEM {
        string id
        string categoryId
        string name
        float price
        string description
        string status
        boolean isChefRecommended
    }

    MODIFIER_GROUP {
        string id
        string menuItemId
        string name
        boolean required
    }

    MODIFIER_OPTION {
        string id
        string modifierGroupId
        string name
        float priceDelta
    }

    ORDER {
        string id
        string tableSessionId
        string status
        float totalAmount
        datetime createdAt
    }

    ORDER_ITEM {
        string id
        string orderId
        string menuItemId
        int quantity
        float price
        string note
    }

    ORDER_ITEM_MODIFIER {
        string id
        string orderItemId
        string modifierOptionId
    }

    PAYMENT {
        string id
        string orderId
        string method
        string status
        float amount
        datetime paidAt
    }

    USER ||--o{ ORDER : places
    RESTAURANT ||--o{ TABLE : has
    TABLE ||--o{ TABLE_SESSION : opens
    TABLE_SESSION ||--|| ORDER : owns
    CATEGORY ||--o{ MENU_ITEM : contains
    MENU_ITEM ||--o{ MODIFIER_GROUP : has
    MODIFIER_GROUP ||--o{ MODIFIER_OPTION : includes
    ORDER ||--o{ ORDER_ITEM : includes
    ORDER_ITEM ||--o{ ORDER_ITEM_MODIFIER : uses
    MODIFIER_OPTION ||--o{ ORDER_ITEM_MODIFIER : selected
    ORDER ||--|| PAYMENT : paid_by
```

---

## 6. Core Features

### Customer (Dine-in)

- QR-based menu access
- Menu browsing with search and filters
- Shopping cart with modifiers
- Add items to active order
- Real-time order tracking
- Request bill and pay after meal

### Waiter

- Receive real-time order notifications
- View orders by table
- Accept or reject order items
- Send orders to kitchen
- Mark orders as served

### Kitchen Staff (KDS)

- Real-time order queue
- Order timers and alerts
- Update item status (Preparing → Ready)

### Admin

- Menu and category management
- Modifier and pricing configuration
- Table and QR code management
- Order monitoring via KDS
- Revenue reports and analytics
- Staff account management

---

## 7. Advanced Features (Optional)

- Redis caching for menu and session data
- Fuzzy search for menu items
- Multi-language support (EN / VI)
- Docker containerization
- CI/CD pipeline with GitHub Actions

---

## 8. Deployment

The system is containerized using Docker and can be deployed to any public hosting provider supporting Docker-based applications.

---

## 9. Setup & Running Instructions

### 9.1 Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 15.x (for local setup)
- **Redis** >= 7.x (optional, for caching)
- **Docker** & **Docker Compose** (for Docker setup)

### 9.2 Environment Configuration

#### Backend Environment Variables

Copy `.env.example` to `.env` in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Update the following variables in `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Authentication
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here
REFRESH_SECRET_KEY=your-refresh-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=4000
```

---

### 9.3 Method 1: Running Locally

#### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### Step 2: Setup Database

Make sure PostgreSQL is running, then:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

#### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

#### Step 4: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Admin Login:** Use credentials from seeded data

---

### 9.4 Method 2: Running with Docker

#### Step 1: Start All Services

From the project root directory:

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Step 2: Initialize Database

The backend container automatically runs migrations on startup. To seed the database:

```bash
# Access backend container
docker-compose exec backend sh

# Run seed command
npm run prisma db seed

# Exit container
exit
```

#### Step 3: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

#### Step 4: Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

---

### 9.5 Useful Commands

#### Local Development

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev --name <migration-name>  # Create new migration

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Docker

```bash
# Rebuild containers after code changes
docker-compose up -d --build

# View running containers
docker-compose ps

# Stop specific service
docker-compose stop backend

# Restart specific service
docker-compose restart backend

# Remove all containers and volumes
docker-compose down -v

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# View real-time logs
docker-compose logs -f --tail=100
```

---

### 9.6 Default Login Credentials (After Seeding)

Check `backend/prisma/seed.ts` for default user credentials created during database seeding.

Typical default accounts:
- **Super Admin:** superadmin@restaurant.com
- **Admin:** admin@restaurant.com
- **Waiter:** waiter@restaurant.com
- **Kitchen:** kitchen@restaurant.com
- **Customer:** customer@restaurant.com

Default password is usually set in the seed file.

---

### 9.7 Troubleshooting

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :4000
netstat -ano | findstr :5173

# Kill the process (Windows)
taskkill /PID <process-id> /F
```

#### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb restaurant`

#### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

#### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually
npx prisma migrate dev --create-only
npx prisma migrate deploy
```

---

## 10. Contributors

| Name     | Responsibility                                     |
| -------- | -------------------------------------------------- |
| Member 1 | Customer Ordering, Order Flow, KDS, Real-time      |
| Member 2 | Authentication, Admin Management, Payment, Reports |

---

## 11. Demo Flow

1. Admin logs in and creates menu
2. Admin creates tables and generates QR codes
3. Customer scans QR and places order
4. Waiter accepts order and sends to kitchen
5. Kitchen prepares and marks order ready
6. Customer requests bill and completes payment

---

**End of Document**

