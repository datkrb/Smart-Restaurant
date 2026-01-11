# Backend Module Structure

## Cấu trúc Module

Backend được tổ chức theo kiến trúc module để dễ quản lý và mở rộng.(12/1)

### 📁 Modules

#### 1. **admin** - Quản lý Admin
- `admin.routes.ts` - Tổng hợp tất cả routes admin

#### 2. **auth** - Xác thực & Phân quyền
- `auth.controller.ts` - Xử lý đăng nhập, đăng ký
- `auth.service.ts` - Logic nghiệp vụ xác thực
- `auth.middleware.ts` - Middleware kiểm tra quyền
- `auth.routes.ts` - Routes xác thực

#### 3. **category** - Quản lý Danh mục
- `category.controller.ts` - CRUD danh mục món ăn
- `category.routes.ts` - Routes danh mục

#### 4. **menu-item** - Quản lý Món ăn
- `menu-item.controller.ts` - CRUD món ăn
- `photo.controller.ts` - Quản lý ảnh món ăn
- `modifier.controller.ts` - Quản lý tùy chọn món ăn (size, topping...)
- `menu-item.routes.ts` - Routes món ăn

#### 5. **order** - Quản lý Đơn hàng
- `order.controller.ts` - Tạo đơn hàng (khách)
- `admin-order.controller.ts` - Quản lý đơn hàng (admin/kitchen)
- `order.routes.ts` - Routes đơn hàng

#### 6. **table** - Quản lý Bàn
- `table.controller.ts` - CRUD bàn, tạo QR code
- `table.service.ts` - Logic nghiệp vụ bàn
- `table.routes.ts` - Routes bàn

#### 7. **user** - Quản lý Người dùng
- `user.controller.ts` - CRUD người dùng
- `user.service.ts` - Logic nghiệp vụ người dùng
- `user.routes.ts` - Routes người dùng

#### 8. **guest** - Chức năng Khách hàng
- `guest.controller.ts` - Xem menu, đặt món, review
- `guest.routes.ts` - Routes khách hàng

#### 9. **waiter** - Chức năng Nhân viên phục vụ
- `waiter.controller.ts` - Quản lý bàn được giao, phục vụ món
- `waiter.routes.ts` - Routes nhân viên

## API Routes

### `/api/v1/*` - Routes chung
- `/api/v1/auth/*` - Xác thực
- `/api/v1/users/*` - Người dùng
- `/api/v1/tables/*` - Bàn

### `/api/admin/*` - Routes Admin
- `/api/admin/categories/*` - Danh mục
- `/api/admin/menu-items/*` - Món ăn
- `/api/admin/tables/*` - Bàn
- `/api/admin/orders/*` - Đơn hàng

### `/api/guest/*` - Routes Khách hàng
- `/api/guest/session` - Bắt đầu phiên
- `/api/guest/categories` - Xem danh mục
- `/api/guest/menu-items` - Xem món ăn
- `/api/guest/orders` - Đặt món

### `/api/waiter/*` - Routes Nhân viên
- `/api/waiter/assigned-tables` - Bàn được giao
- `/api/waiter/ready-orders` - Đơn sẵn sàng phục vụ
- `/api/waiter/orders/:id/serve` - Đánh dấu đã phục vụ

## Lợi ích của cấu trúc này

✅ **Tổ chức rõ ràng**: Mỗi module quản lý một domain riêng biệt
✅ **Dễ bảo trì**: Tìm và sửa code dễ dàng
✅ **Dễ mở rộng**: Thêm chức năng mới không ảnh hưởng code cũ
✅ **Tái sử dụng**: Controller có thể tái sử dụng ở nhiều routes
✅ **Phân quyền rõ ràng**: Admin, Guest, Waiter có routes riêng
