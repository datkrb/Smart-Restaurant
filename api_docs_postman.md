# Postman API Collection Guide

Here are the API endpoints used in the Admin Menu Page. You can import these into Postman.

**Base URL**: `http://localhost:4000/api/v1`
**Authorization**: `Bearer <YOUR_ACCESS_TOKEN>` (Login first to get token)

---

## 1. Get All Categories
**Method**: `GET`
**URL**: `{{baseUrl}}/menu/categories`

---

## 2. Get All Menu Items (Admin View)
**Method**: `GET`
**URL**: `{{baseUrl}}/menu?limit=1000`

---

## 3. Create Menu Item
**Method**: `POST`
**URL**: `{{baseUrl}}/menu/menu-items`
**Body (JSON)**:
```json
{
  "name": "Special Burger",
  "categoryId": "REPLACE_WITH_CATEGORY_ID",
  "price": 150000,
  "description": "Delicious beef burger with cheese",
  "isChefRecommended": true,
  "status": "AVAILABLE"
}
```

---

## 4. Update Menu Item
**Method**: `PATCH`
**URL**: `{{baseUrl}}/menu/menu-items/:id`
**(Replace `:id` with actual Item ID)**
**Body (JSON)**:
```json
{
  "price": 160000,
  "status": "SOLD_OUT"
}
```

---

## 5. Delete Menu Item
**Method**: `DELETE`
**URL**: `{{baseUrl}}/menu/menu-items/:id`

---

## 6. Login (To get Token)
**Method**: `POST`
**URL**: `{{baseUrl}}/auth/login`
**Body (JSON)**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
