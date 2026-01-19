# 📚 Smart Restaurant - API & Frontend Documentation

## Base URLs

- **Backend API**: `http://localhost:4000/api/v1`
- **Frontend**: `http://localhost:5173`

---

# 🔗 FRONTEND ROUTES

## Public Routes (No Auth)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `EntryPoint` | QR code landing page |
| `/menu` | `MenuPage` | Menu browsing (infinite scroll) |
| `/tracking` | `OrderTrackingPage` | Guest order tracking |
| `/login` | `LoginPage` | User login + register |
| `/forgot-password` | `ForgotPasswordPage` | Request password reset |
| `/reset-password` | `ResetPasswordPage` | Reset with token |
| `/verify-email` | `VerifyEmailPage` | Email verification |
| `/oauth-success` | `OAuthSuccessPage` | Google OAuth callback |

## Protected Routes

### Customer (CUSTOMER role)
| Path | Component |
|------|-----------|
| `/profile` | `ProfilePage` (tabs: Profile, Password, Orders) |

### Admin (ADMIN, SUPER_ADMIN roles)
| Path | Component |
|------|-----------|
| `/admin` | `AdminDashboardPage` |
| `/admin/categories` | `CategoryPage` |
| `/admin/menu` | `AdminMenuPage` |
| `/admin/tables` | `AdminTablePage` |
| `/admin/orders` | `AdminOrdersPage` |
| `/admin/users` | `AdminUsersPage` |
| `/admin/employees` | `AdminEmployeesPage` |

### Staff
| Path | Roles | Component |
|------|-------|-----------|
| `/waiter` | WAITER, KITCHEN, ADMIN | `WaiterPage` |
| `/kitchen` | KITCHEN, WAITER, ADMIN | `KitchenPage` |

---

# 🔌 BACKEND API ENDPOINTS

## Authentication `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login (email/password) |
| POST | `/refresh` | ❌ | Refresh access token |
| POST | `/logout` | ✅ | Logout (clear refresh token) |
| POST | `/verify-email` | ❌ | Verify email with token |
| POST | `/forgot-password` | ❌ | Request password reset |
| POST | `/reset-password` | ❌ | Reset password with token |
| GET | `/google` | ❌ | Google OAuth redirect |
| GET | `/google/callback` | ❌ | Google OAuth callback |

---

## Users `/api/v1/users`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/profile` | ✅ | Any | Get current user profile |
| PATCH | `/profile` | ✅ | Any | Update profile (name) |
| PATCH | `/profile/password` | ✅ | Any | Change password |
| POST | `/profile/avatar` | ✅ | Any | Upload avatar image |
| GET | `/profile/orders` | ✅ | Any | Get order history |
| GET | `/` | ✅ | ADMIN | Get all users (paginated) |
| POST | `/` | ✅ | ADMIN | Create new user |
| PATCH | `/:id` | ✅ | ADMIN | Update user |
| PATCH | `/:id/status` | ✅ | ADMIN | Activate/deactivate user |
| DELETE | `/:id` | ✅ | ADMIN | Delete user |

---

## Menu `/api/v1/menu`

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ✅ | Get all categories |
| GET | `/categories/:id` | ✅ | Get category by ID |
| POST | `/categories` | ✅ ADMIN | Create category |
| PATCH | `/categories/:id` | ✅ ADMIN | Update category |
| DELETE | `/categories/:id` | ✅ ADMIN | Delete category |

### Menu Items
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all items (filter, paginate) |
| GET | `/menu-items/:id` | ✅ | Get item by ID |
| GET | `/menu-items/category/:categoryId` | ✅ | Get items by category |
| POST | `/menu-items` | ✅ ADMIN | Create menu item |
| PATCH | `/menu-items/:id` | ✅ ADMIN | Update menu item |
| DELETE | `/menu-items/:id` | ✅ ADMIN | Delete menu item |

### Photos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/menu-items/:itemId/photos` | ✅ ADMIN | Upload photos (max 5) |
| PATCH | `/photos/set-primary` | ✅ ADMIN | Set primary photo |
| DELETE | `/photos/:photoId` | ✅ ADMIN | Delete photo |

### Modifiers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/modifiers/groups` | ✅ ADMIN | Create modifier group |
| POST | `/modifiers/options` | ✅ ADMIN | Create modifier option |
| PATCH | `/modifiers/groups/:id` | ✅ ADMIN | Update group |
| DELETE | `/modifiers/groups/:id` | ✅ ADMIN | Delete group |
| PATCH | `/modifiers/options/:id` | ✅ ADMIN | Update option |
| DELETE | `/modifiers/options/:id` | ✅ ADMIN | Delete option |

---

## Guest `/api/v1/guest` (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/session` | ❌ | Start table session (QR scan) |
| GET | `/categories` | ❌ | Get categories (public) |
| GET | `/menu-items` | ❌ | Get menu items (public) |
| GET | `/orders/:sessionId` | ❌ | Get order by session |
| POST | `/orders/:orderId/request-bill` | ❌ | Request bill |
| GET | `/menu-items/:menuItemId/reviews` | ❌ | Get item reviews |
| POST | `/menu-items/:menuItemId/reviews` | ⚪ | Create review (optional auth) |

---

## Orders `/api/v1/orders`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ❌ | Any | Create order (guest) |
| GET | `/session/:sessionId` | ❌ | Any | Get order by session |
| GET | `/` | ✅ | Staff | Get all orders (filtered) |
| PATCH | `/:id/status` | ✅ | Staff | Update order status |
| PATCH | `/:id/items` | ✅ | Waiter | Update item statuses |
| POST | `/:id/complete` | ✅ | Waiter | Complete + close session |

---

## Tables `/api/v1/tables`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | ✅ | Staff | Get all tables |
| GET | `/:id/qr` | ✅ | Staff | Get QR code data |
| POST | `/:id/regenerate-qr` | ✅ | ADMIN | Regenerate single QR |
| POST | `/regenerate-all-qr` | ✅ | ADMIN | Regenerate all QRs |
| POST | `/verify-qr` | ✅ | Any | Verify QR token |
| POST | `/` | ✅ | ADMIN | Create table |
| PATCH | `/:id` | ✅ | ADMIN | Update table |
| DELETE | `/:id` | ✅ | ADMIN | Delete table |

---

## Reports `/api/v1/reports`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | ✅ ADMIN | Dashboard stats |
| GET | `/revenue` | ✅ ADMIN | Revenue by date range |
| GET | `/top-items` | ✅ ADMIN | Top selling items |
| GET | `/user-stats` | ✅ ADMIN | User statistics |

---

# 🔔 SOCKET.IO EVENTS

## Rooms
- `WAITER` - Waiter notifications
- `KITCHEN` - Kitchen notifications  
- `ADMIN` - Admin notifications
- `session_{id}` - Customer order tracking

## Events

| Event | Direction | From → To | Data |
|-------|-----------|-----------|------|
| `new_order` | Server → Client | → Waiter, Admin | `{orderId, tableId, tableName, items, totalAmount}` |
| `order_accepted` | Server → Client | → Kitchen | `{orderId, status}` |
| `order_ready` | Server → Client | → Waiter, Customer | `{orderId, tableSessionId}` |
| `order_served` | Server → Client | → Customer | `{orderId, tableSessionId}` |
| `order_status_change` | Server → Client | → All rooms | `{orderId, status}` |
| `join_room` | Client → Server | | `{role, tableSessionId?}` |

---

# 📦 REQUEST/RESPONSE EXAMPLES

## Login
```json
POST /api/v1/auth/login
Body: { "email": "admin@test.com", "password": "123456" }
Response: { 
  "user": { "id", "email", "fullName", "role" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## Create Order
```json
POST /api/v1/orders
Body: {
  "tableSessionId": "uuid",
  "items": [
    { "menuItemId": "uuid", "quantity": 2, "note": "No ice", "modifiers": ["optionId1"] }
  ]
}
```

## Get Menu Items
```
GET /api/v1/guest/menu-items?page=1&limit=20&search=pizza&categoryId=uuid&isChefRecommended=true&sortBy=price
```
