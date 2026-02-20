<div align="center">

# 📝 Blog Platform API

### Enterprise-grade REST API with Advanced Authentication & Social Features

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)

</div>

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- JWT-based authentication with refresh tokens
- Email verification & password reset flows
- Token versioning for session management
- HTTP-only secure cookies
- Role-based access control (User/Admin)

</td>
<td width="50%">

### 📱 **Social Platform**
- Full CRUD operations for blog posts
- Nested comments system
- Like/Unlike functionality
- Follow/Unfollow users
- User profiles with activity stats

</td>
</tr>
<tr>
<td width="50%">

### ⚡ **Performance & Best Practices**
- Pagination on all list endpoints
- Soft deletes for data integrity
- Optimized database queries with Prisma
- Input validation with Zod schemas
- Type-safe development with TypeScript

</td>
<td width="50%">

### 🛠️ **Developer Experience**
- Clean architecture & modular design
- Comprehensive error handling
- RESTful API conventions
- Auto-generated Prisma Client
- Easy local setup with migrations

</td>
</tr>
</table>

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT + HTTP-only Cookies
- **Email Service:** Resend
- **Validation:** Zod

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/JYupix/blog-platform-api.git
cd blog-platform-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations (uses migrate.ps1 script)
.\migrate.ps1 -Name "init"

# Start development server
npm run dev
```

**Server runs on:** `http://localhost:3000`

> **Note:** The `migrate.ps1` script automatically runs migrations and generates the Prisma Client in one command.

## 🔑 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blog_platform"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
RESEND_API_KEY="re_xxxxxxxxxxxx"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

## 📚 API Endpoints

### 🔐 Authentication
```http
POST   /api/auth/register           # Register new user
GET    /api/auth/verify-email       # Verify email with token
POST   /api/auth/login               # Login & get tokens
POST   /api/auth/logout              # Logout & clear session
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password      # Reset password with token
GET    /api/auth/me                  # Get current user (Protected)
```

### 👤 Users
```http
GET    /api/users/:username          # Get user profile & posts
GET    /api/users/me                 # Get my profile (Protected)
PATCH  /api/users/me                 # Update profile (Protected)
POST   /api/users/:username/follow   # Follow/Unfollow user (Protected)
GET    /api/users/:username/followers # Get user followers
GET    /api/users/:username/following # Get user following
```

### 📝 Posts
```http
GET    /api/posts                    # Get all posts (paginated)
POST   /api/posts                    # Create post (Protected)
GET    /api/posts/me                 # Get my posts (Protected)
GET    /api/posts/:slug              # Get post by slug
PATCH  /api/posts/:id                # Update post (Protected)
DELETE /api/posts/:id                # Delete post (Protected)
```

### 💬 Comments
```http
GET    /api/posts/:id/comments       # Get post comments (paginated)
POST   /api/posts/:id/comments       # Add comment (Protected)
GET    /api/comments/me              # Get my comments (Protected)
PATCH  /api/comments/:id             # Update comment (Protected)
DELETE /api/comments/:id             # Delete comment (Protected)
```

### ❤️ Likes
```http
POST   /api/posts/:id/like           # Like/Unlike post (Protected)
GET    /api/posts/:id/likes          # Get post likes (paginated)
```

> **Note:** All list endpoints support `?page=1&limit=10` query parameters

## 🗂️ Database Schema

```prisma
User → Posts (1:N)
User → Comments (1:N)
User → Likes (1:N)
User → Followers/Following (N:N)
Post → Comments (1:N)
Post → Likes (1:N)
```

## 🎯 Key Highlights for Recruiters

✅ **Production-Ready Code** - Enterprise patterns, error handling, security best practices  
✅ **Type Safety** - Full TypeScript implementation with strict mode  
✅ **Scalable Architecture** - Modular design, separation of concerns  
✅ **Database Design** - Normalized schema, soft deletes, proper indexing  
✅ **API Design** - RESTful conventions, pagination, consistent responses  
✅ **Security First** - JWT, token rotation, secure cookies, input validation  

## 📄 License

MIT © [JYupix](https://github.com/JYupix)

---

<div align="center">

**[⬆ Back to Top](#-blog-platform-api)**

Made with ❤️ by [JYupix](https://github.com/JYupix)

</div>