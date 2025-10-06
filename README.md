# 🏢 Broker App - Backend API

Complete NestJS + Prisma backend for Angolan broker platform with **JWT authentication**, **file uploads**, and **role-based access control**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (.env file)
DATABASE_URL="postgresql://postgres:password@localhost:5432/broker"
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="your-64-char-secret"

# 3. Run migration
npx prisma migrate dev

# 4. Start server
npm run start:dev
```

**API:** `http://localhost:3000/api`  
**Swagger:** `http://localhost:3000/api/docs`  
**Uploads:** `http://localhost:3000/uploads/`

---

## ✨ Features

### 🔐 **Authentication**

- JWT tokens (access 15min + refresh 7days)
- User registration (public) & Admin registration (admin-only)
- Password reset with secure tokens
- Role-based access control (USER/ADMIN)

### 📁 **File Upload**

- Multiple images + videos per listing
- Automatic file type detection
- Listing-specific folders
- Static file serving
- Supports: JPG, PNG, WEBP, GIF, MP4, MPEG

### 🏠 **Listings (4 Types)**

1. **Houses** - Complete property details
2. **Cars** - Vehicle information
3. **Land** - Agricultural/Residential
4. **Machines** - Equipment & machinery

### 🛡️ **Security**

- ADMIN-only create/update/delete
- Public browse & search
- bcrypt password hashing
- SQL injection prevention

---

## 📋 API Endpoints

### **Authentication** (9 endpoints)

```
POST   /api/auth/register          - Register USER
POST   /api/auth/register-admin    - Register ADMIN (admin-only)
POST   /api/auth/login             - Login
POST   /api/auth/refresh           - Refresh token
GET    /api/auth/me                - Get profile
POST   /api/auth/forgot-password   - Request reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/users             - List users (admin-only)
```

### **Listings** (Each type: Car/Land/House/Machine)

```
POST   /api/{type}-listings          - Create (ADMIN only) 🔒
GET    /api/{type}-listings          - Browse all
GET    /api/{type}-listings/:id      - View one
PATCH  /api/{type}-listings/:id      - Update (ADMIN only) 🔒
DELETE /api/{type}-listings/:id      - Delete (ADMIN only) 🔒

PATCH  /api/{type}-listings/:id/media/add      - Add media (ADMIN) 🔒
PATCH  /api/{type}-listings/:id/media/replace  - Replace media (ADMIN) 🔒
DELETE /api/{type}-listings/:id/media/:filename - Delete file (ADMIN) 🔒
```

**Total:** 35+ endpoints

---

## 🧪 Testing

**See:** `MACHINE_LISTING_TEST_DATA.txt` for complete Postman test data

### **Quick Test:**

**1. Login as admin:**

```
POST /api/auth/login
```

**2. Create machine with files:**

```
POST /api/machine-listings

Body (form-data):
  title = Caterpillar 320D Excavator
  price = 45000
  machineDetails = {JSON from test file}
  files (File) = machine.jpg
  files (File) = demo.mp4
```

**3. Browse:**

```
GET /api/machine-listings
```

---

## 🗄️ Database

**PostgreSQL** with Prisma ORM

**Models:**

- User (with roles)
- Listing (unified)
- LandDetails, CarDetails, HouseDetails, MachineDetails
- Account, Verification (auth)

---

## 📸 File Storage

```
uploads/
├── car/{listing-id}/
├── land/{listing-id}/
├── house/{listing-id}/
└── machine/{listing-id}/
    ├── photos.jpg
    └── videos.mp4
```

---

## 🔒 Access Control

**Public (no auth):**

- Browse listings
- View details
- Search & filter

**ADMIN only:**

- Create listings
- Update listings
- Delete listings
- Manage users
- Upload files

---

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL + Prisma
- **Auth:** JWT (stateless)
- **Upload:** Multer
- **Docs:** Swagger/OpenAPI
- **Language:** TypeScript

---

## 📚 Documentation

- **Swagger UI:** `http://localhost:3000/api/docs`
- **Test Data:** `MACHINE_LISTING_TEST_DATA.txt`
- **API Requests:** `api-requests.http`

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/broker"

# JWT
JWT_SECRET="64-char-hex-string"
JWT_REFRESH_SECRET="64-char-hex-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

---

## 🎯 Quick Commands

```bash
npm run start:dev      # Start server
npx prisma studio      # View database
npx prisma migrate dev # Run migrations
npx prisma generate    # Regenerate client
```

---

## ✅ Complete Feature List

- ✅ JWT authentication (stateless)
- ✅ Role-based access (USER/ADMIN)
- ✅ Password reset flow
- ✅ User management (admin)
- ✅ File upload (images + videos)
- ✅ 4 listing types
- ✅ Media management (add/replace/delete)
- ✅ Advanced filtering & search
- ✅ Pagination
- ✅ Swagger documentation
- ✅ Custom error messages
- ✅ Production-ready

---

## 🚀 Production Ready

Your backend is **enterprise-grade** and ready for deployment!

**Test with:** `MACHINE_LISTING_TEST_DATA.txt`  
**Explore in:** `http://localhost:3000/api/docs`

---

**Built with ❤️ for Angola's broker platform**
