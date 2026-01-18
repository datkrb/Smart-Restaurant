# QR Code Regeneration Implementation Guide

## ✅ What Was Implemented

### Backend Changes:
1. **Database Schema** (`schema.prisma`):
   - Added `qrSecret` field to Table model for signing QR tokens.
   - Added `qrVersion` field for secure invalidation.

2. **Table Service** (`table.service.ts`):
   - **Shortened Token**: Optimized JWT payload to only include `{ v: version }`, significantly reducing QR code complexity.
   - `regenerateTableQRCode()`: Increments version and generates new secret to invalidate old codes.
   - `verifyQRToken()`: Validates signature and checks if version matches current DB state.
   - `getTables()`: Returns `qrCodeUrl` pre-populated with the secure token.
   - URL Format: `/?tableId=xxx&token=yyy`

3. **Guest Service** (`guest.service.ts`):
   - **Security Enforcement**: `startOrGetSession` now strictly verifies the QR token before allowing session creation.

### Frontend Changes:
1. **Admin Table Page** (`AdminTablePage.tsx`):
   - **PDF Download**: Added professional PDF export (containing QR code and Table name) using `jsPDF`.
   - **PNG Download**: High-resolution PNG option for quick printing.
   - **Automatic Refresh**: Uses a timestamp parameter (`&t=...`) to force the browser to update the QR image visually after regeneration.
   - **Regeneration UI**: Buttons for single table and "Regenerate All" with loading states and confirmations.

2. **Entry Point** (`EntryPoint.tsx`):
   - Extracts and validates the secure `token` from the URL.
   - Provides user-friendly error messages for expired or invalid QR codes.

---

## 🔧 Setup & Deployment

### 1. Database Update
```bash
cd backend
npx prisma migrate dev --name add_qr_security
# Ensure client is updated
npx prisma generate
```

### 2. Environment Configuration
**Backend `.env`**:
- `FRONTEND_URL`: Set to your public domain (e.g., `https://menu.restaurant.com`).
- `JWT_SECRET`: Ensure a strong secret is used for signing.

**Frontend `.env`**:
- `VITE_FRONTEND_URL`: Must match backend's `FRONTEND_URL`.

### 3. Usage
1. Go to **Admin > Tables**.
2. If this is a new installation, click **Regenerate All QR** to initialize secure tokens.
3. Click "View Large QR" on any table.
4. Use **Download (PDF)** for professional printing.
5. Use **Download (PNG)** for quick digital sharing.

---

## 🔒 Security Summary
- **Tamper Proof**: Tokens are signed; any change to parameters in the URL will invalidate the token.
- **Instant Invalidation**: Once "Regenerate" is clicked, all previous QR codes for that table become useless immediately.
- **Production Ready**: Handles dynamic domains and cross-environment configuration via environment variables.
