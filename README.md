<div align="center">

# 📝 Blog Platform API

### Enterprise-grade REST API with Advanced Authentication & Social Features

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- JWT access token (15 min) + refresh token (7 days)
- Email verification & password reset flows
- HTTP-only secure cookies with CORS support
- Role-based access control (User / Admin)
- Token versioning for instant session invalidation
- Rate limiting on all routes & stricter limits on auth
- Input validation with Zod schemas & env var validation at startup

</td>
<td width="50%">

### 📱 **Social Platform**
- Full CRUD for blog posts with soft deletes
- Nested comments system
- Like / Unlike posts
- Bookmark / Unbookmark posts
- Follow / Unfollow users
- Personalized feed from followed users
- Tags & Categories for content organization

</td>
</tr>
<tr>
<td width="50%">

### 🖼️ **Media & Storage**
- Profile photo upload via Cloudinary
- Post cover image upload via Cloudinary
- Old image auto-deletion on update
- File validation (JPEG / PNG / WebP, 5 MB max)
- On-the-fly image transformations

</td>
<td width="50%">

### 🛠️ **Developer Experience**
- Interactive Swagger UI at `/api/docs`
- Structured logging with Winston (business actions + HTTP)
- Unique `requestId` per request with timing & IP
- Modular architecture & clean separation of concerns
- Pagination on all list endpoints
- Optimized Prisma queries

</td>
</tr>
</table>

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js 5 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT + HTTP-only Cookies |
| Image Storage | Cloudinary + Multer |
| Email Service | Resend |
| Validation | Zod |
| Logging | Winston |
| Documentation | Swagger / OpenAPI 3.0 |

---

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

# Run database migrations
.\migrate.ps1 -Name "init"

# Start development server
npm run dev
```

**Server runs on:** `http://localhost:3000`  
**API Docs (dev):** `http://localhost:3000/api/docs`

> **Note:** The `migrate.ps1` script automatically runs migrations and generates the Prisma Client in one command.

---

## 🔑 Environment Variables

```env
PORT=3000
NODE_ENV="development"

DATABASE_URL="postgresql://user:password@localhost:5432/blog_platform"

JWT_SECRET="your-super-secret-jwt-key"

RESEND_API_KEY="re_xxxxxxxxxxxx"
FRONTEND_URL="http://localhost:5173"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 📚 API Endpoints

### 🏥 Health
```http
GET    /api/health                         # Server status check
```

### 🔐 Authentication
```http
POST   /api/auth/register                  # Register new user
GET    /api/auth/verify-email              # Verify email with token
POST   /api/auth/login                     # Login & set auth cookie
POST   /api/auth/logout                    # Logout & clear both cookies
POST   /api/auth/refresh                   # Refresh access token using refresh cookie
POST   /api/auth/forgot-password           # Request password reset email
POST   /api/auth/reset-password            # Reset password with token
GET    /api/auth/me                        # Get current user 🔒
```

### 👤 Users
```http
GET    /api/users?search=                  # Search users by name or username
GET    /api/users/me                       # Get my profile & stats 🔒
PATCH  /api/users/me                       # Update my profile 🔒
PATCH  /api/users/me/upload-photo          # Upload profile photo 🔒 📷
GET    /api/users/:username                # Get user public profile & posts
POST   /api/users/:username/follow         # Follow / Unfollow user 🔒
GET    /api/users/:username/followers      # Get user followers
GET    /api/users/:username/following      # Get user following
PATCH  /api/users/:username                # Update user 🔒 👑
DELETE /api/users/:username                # Soft delete user 🔒 👑
```

### 📝 Posts
```http
GET    /api/posts                          # Get published posts (paginated, searchable)
POST   /api/posts                          # Create post 🔒
GET    /api/posts/me                       # Get my posts (drafts + published) 🔒
GET    /api/posts/feed                     # Get feed from followed users 🔒
GET    /api/posts/:slug                    # Get post by slug
PATCH  /api/posts/:id                      # Update post 🔒
DELETE /api/posts/:id                      # Soft delete post 🔒
PATCH  /api/posts/:id/upload-cover         # Upload cover image 🔒 📷
```

### 💬 Comments
```http
GET    /api/posts/:id/comments             # Get post comments (paginated)
POST   /api/posts/:id/comments             # Add comment 🔒
GET    /api/comments/me                    # Get my comments 🔒
PATCH  /api/comments/:id                   # Update comment 🔒
DELETE /api/comments/:id                   # Delete comment 🔒
```

### ❤️ Likes
```http
POST   /api/posts/:id/like                 # Like / Unlike post 🔒
GET    /api/posts/:id/likes                # Get post likes (paginated)
```

### 🔖 Bookmarks
```http
POST   /api/posts/:id/bookmark             # Bookmark / Unbookmark post 🔒
GET    /api/bookmarks/me                   # Get my bookmarks 🔒
```

### 🏷️ Tags
```http
GET    /api/tags                           # Get all tags with post count
POST   /api/tags                           # Create tag 🔒 👑
PATCH  /api/tags/:slug                     # Update tag 🔒 👑
DELETE /api/tags/:slug                     # Delete tag 🔒 👑
GET    /api/tags/:slug/posts               # Get posts by tag (paginated)
```

### 📂 Categories
```http
GET    /api/categories                     # Get all categories with post count
POST   /api/categories                     # Create category 🔒 👑
PATCH  /api/categories/:slug               # Update category 🔒 👑
DELETE /api/categories/:slug               # Delete category 🔒 👑
GET    /api/categories/:slug/posts         # Get posts by category (paginated)
```

> 🔒 Requires authentication &nbsp;|&nbsp; 👑 Requires Admin role &nbsp;|&nbsp; 📷 Multipart/form-data  
> All list endpoints support `?page=1&limit=10` query parameters.

---

## 🗂️ Database Schema

```
User ──── Posts       (1:N)
User ──── Comments    (1:N)
User ──── Likes       (1:N)
User ──── Bookmarks   (1:N)
User ──── Followers   (N:N self-referential)
Post ──── Comments    (1:N)
Post ──── Likes       (1:N)
Post ──── Bookmarks   (1:N)
Post ──── Tags        (N:N via PostTag)
Post ──── Category    (N:1)
```

---

## 🎯 Key Highlights for Recruiters

✅ **Production-Ready Code** — Enterprise patterns, error handling, security best practices  
✅ **Type Safety** — Full TypeScript implementation with strict mode  
✅ **Scalable Architecture** — Modular design, clean separation of concerns  
✅ **Database Design** — Normalized schema, soft deletes, proper indexing  
✅ **API Design** — RESTful conventions, pagination, consistent responses  
✅ **Security First** — JWT dual-token strategy, token versioning, secure cookies, CORS, rate limiting, input validation  
✅ **Media Handling** — Cloudinary integration with auto-deletion and image transformations  
✅ **Observability** — Structured Winston logging with per-request ID, timing, user and IP tracking  
✅ **Documentation** — Interactive Swagger UI with full OpenAPI 3.0 spec  

---

## 📄 License

MIT © [JYupix](https://github.com/JYupix)

---

<div align="center">

**[⬆ Back to Top](#-blog-platform-api)**

Made with ❤️ by [JYupix](https://github.com/JYupix)

</div>

