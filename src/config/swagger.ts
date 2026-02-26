import swaggerJsdoc from "swagger-jsdoc";
import { ENV } from "./env.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog Platform API",
      version: "1.0.0",
      description:
        "REST API for a blog platform with auth, posts, comments, likes, bookmarks and follows.",
    },
    servers: [
      {
        url:
          ENV.NODE_ENV === "production"
            ? "/api"
            : `http://localhost:${ENV.PORT}/api`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
            hasMore: { type: "boolean" },
          },
        },
        UserSummary: {
          type: "object",
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            name: { type: "string" },
            profileImage: { type: "string", nullable: true },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            slug: { type: "string" },
            coverImage: { type: "string", nullable: true },
            published: { type: "boolean" },
            publishedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            author: { $ref: "#/components/schemas/UserSummary" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            author: { $ref: "#/components/schemas/UserSummary" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        Tag: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "typescript" },
            slug: { type: "string", example: "typescript" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Technology" },
            slug: { type: "string", example: "technology" },
          },
        },
        PostDetail: {
          allOf: [
            { $ref: "#/components/schemas/Post" },
            {
              type: "object",
              properties: {
                content: { type: "string" },
                updatedAt: { type: "string", format: "date-time" },
                category: { $ref: "#/components/schemas/Category", nullable: true },
                tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
                likesCount: { type: "integer", example: 12 },
                commentsCount: { type: "integer", example: 5 },
              },
            },
          ],
        },
      },
    },
    paths: {
      // ── HEALTH ────────────────────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns API status. Use this to verify the server is up.",
          responses: {
            200: {
              description: "API is running.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── AUTH ──────────────────────────────────────────────────────────────
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["username", "email", "password"],
                  properties: {
                    username: { type: "string", minLength: 3 },
                    name: { type: "string", minLength: 3 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered. Verification email sent." },
            400: { description: "Validation error. Invalid input data." },
            409: { description: "Username or email already exists." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/verify-email": {
        post: {
          tags: ["Auth"],
          summary: "Verify email with token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token"],
                  properties: { token: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Email successfully verified." },
            400: { description: "Invalid or expired verification token." },
            404: { description: "User not found." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful." },
            400: { description: "Validation error." },
            401: { description: "Invalid credentials." },
            403: { description: "Email not verified." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          responses: {
            200: { description: "Logout successful." },
            401: { description: "Unauthorized." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } },
                },
              },
            },
          },
          responses: {
            200: {
              description: "If the email exists, a reset link has been sent.",
            },
            400: { description: "Validation error." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password with token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token", "password"],
                  properties: {
                    token: { type: "string" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Password successfully reset." },
            400: { description: "Invalid or expired reset token." },
            404: { description: "User not found." },
            500: { description: "Internal server error." },
          },
        },
      },
      "/auth/me": {
        post: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: "Authenticated user data returned." },
            401: { description: "Unauthorized." },
            500: { description: "Internal server error." },
          },
        },
      },

      // ── POSTS ─────────────────────────────────────────────────────────────
      "/posts": {
        get: {
          tags: ["Posts"],
          summary: "Get published posts",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Paginated list of posts.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Posts"],
          summary: "Create a post",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string", example: "My first post" },
                    content: { type: "string", example: "Post content here..." },
                    published: { type: "boolean", example: false },
                    coverImage: { type: "string", format: "uri" },
                    categoryId: { type: "string" },
                    tags: { type: "array", items: { type: "string" }, example: ["typescript", "nodejs"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Post created.", content: { "application/json": { schema: { type: "object", properties: { post: { $ref: "#/components/schemas/PostDetail" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/me": {
        get: {
          tags: ["Posts"],
          summary: "Get my posts (drafts + published)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "My posts with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/feed": {
        get: {
          tags: ["Posts"],
          summary: "Get posts from followed users",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Feed posts with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/{slug}": {
        get: {
          tags: ["Posts"],
          summary: "Get post by slug",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "my-first-post" } }],
          responses: {
            200: { description: "Post detail.", content: { "application/json": { schema: { type: "object", properties: { post: { $ref: "#/components/schemas/PostDetail" } } } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/{id}": {
        patch: {
          tags: ["Posts"],
          summary: "Update a post",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    published: { type: "boolean" },
                    coverImage: { type: "string", nullable: true },
                    categoryId: { type: "string", nullable: true },
                    tags: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Post updated.", content: { "application/json": { schema: { type: "object", properties: { post: { $ref: "#/components/schemas/PostDetail" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Not the author or admin.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Posts"],
          summary: "Soft delete a post",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Post deleted." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/{id}/upload-cover": {
        patch: {
          tags: ["Posts"],
          summary: "Upload cover image to Cloudinary",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: { file: { type: "string", format: "binary" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Cover image updated.", content: { "application/json": { schema: { type: "object", properties: { post: { $ref: "#/components/schemas/Post" } } } } } },
            400: { description: "No file uploaded or invalid file type.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Upload failed.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── COMMENTS ──────────────────────────────────────────────────────────
      "/posts/{id}/comments": {
        get: {
          tags: ["Comments"],
          summary: "Get comments of a post",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Paginated comments list.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Comments"],
          summary: "Add a comment to a post",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: { content: { type: "string", example: "Great post!" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Comment added.", content: { "application/json": { schema: { type: "object", properties: { comment: { $ref: "#/components/schemas/Comment" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/comments/me": {
        get: {
          tags: ["Comments"],
          summary: "Get my comments",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "My comments with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/comments/{id}": {
        patch: {
          tags: ["Comments"],
          summary: "Update a comment",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: { content: { type: "string", example: "Updated comment text." } },
                },
              },
            },
          },
          responses: {
            200: { description: "Comment updated.", content: { "application/json": { schema: { type: "object", properties: { comment: { $ref: "#/components/schemas/Comment" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Comment not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Comments"],
          summary: "Delete a comment",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Comment deleted." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Comment not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── LIKES ─────────────────────────────────────────────────────────────
      "/posts/{id}/like": {
        post: {
          tags: ["Likes"],
          summary: "Toggle like on a post",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Like removed.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Like removed" } } } } } },
            201: { description: "Post liked.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Post liked" } } } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/posts/{id}/likes": {
        get: {
          tags: ["Likes"],
          summary: "Get likes count for a post",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Likes count.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { likesCount: { type: "integer", example: 42 } },
                  },
                },
              },
            },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── BOOKMARKS ─────────────────────────────────────────────────────────
      "/posts/{id}/bookmark": {
        post: {
          tags: ["Bookmarks"],
          summary: "Toggle bookmark on a post",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Bookmark removed.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Bookmark removed" } } } } } },
            201: { description: "Bookmark added.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Bookmark added" } } } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Post not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/bookmarks/me": {
        get: {
          tags: ["Bookmarks"],
          summary: "Get my bookmarks",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Bookmarks with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      bookmarks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            bookmarkId: { type: "string" },
                            bookarkedAt: { type: "string", format: "date-time" },
                            post: { $ref: "#/components/schemas/Post" },
                          },
                        },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── USERS ─────────────────────────────────────────────────────────────
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Search users",
          parameters: [
            { name: "search", in: "query", required: true, schema: { type: "string", example: "john" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 20 } },
          ],
          responses: {
            200: {
              description: "Users list with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      users: { type: "array", items: { $ref: "#/components/schemas/UserSummary" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            400: { description: "Search query is required.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get my profile",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: { description: "My full profile with posts and stats." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Update my profile",
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    bio: { type: "string", example: "Developer and writer." },
                    username: { type: "string", example: "johndoe" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile updated." },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Username already taken.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/me/upload-photo": {
        patch: {
          tags: ["Users"],
          summary: "Upload profile photo to Cloudinary",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: { file: { type: "string", format: "binary" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile photo updated.", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/UserSummary" } } } } } },
            400: { description: "No file uploaded or invalid file type.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Upload failed.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{username}": {
        get: {
          tags: ["Users"],
          summary: "Get user public profile",
          parameters: [{ name: "username", in: "path", required: true, schema: { type: "string", example: "johndoe" } }],
          responses: {
            200: { description: "User public profile with stats and posts." },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Users (Admin)"],
          summary: "Update a user (admin only)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    role: { type: "string", enum: ["USER", "ADMIN"] },
                    emailVerified: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User updated." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Users (Admin)"],
          summary: "Soft delete a user (admin only)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "User deleted." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{username}/follow": {
        post: {
          tags: ["Users"],
          summary: "Toggle follow a user",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Unfollowed.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Unfollowed" } } } } } },
            201: { description: "Following.", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Following" } } } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{username}/followers": {
        get: {
          tags: ["Users"],
          summary: "Get followers of a user",
          parameters: [
            { name: "username", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Followers list with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      followers: { type: "array", items: { $ref: "#/components/schemas/UserSummary" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{username}/following": {
        get: {
          tags: ["Users"],
          summary: "Get users followed by a user",
          parameters: [
            { name: "username", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Following list with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      following: { type: "array", items: { $ref: "#/components/schemas/UserSummary" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            404: { description: "User not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── TAGS ──────────────────────────────────────────────────────────────
      "/tags": {
        get: {
          tags: ["Tags"],
          summary: "Get all tags",
          responses: {
            200: {
              description: "Tags list.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } } },
                  },
                },
              },
            },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Tags"],
          summary: "Create a tag (admin)",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "typescript" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Tag created.", content: { "application/json": { schema: { type: "object", properties: { tag: { $ref: "#/components/schemas/Tag" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Tag already exists.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/tags/{slug}": {
        patch: {
          tags: ["Tags"],
          summary: "Update a tag (admin)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "typescript" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "TypeScript" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Tag updated.", content: { "application/json": { schema: { type: "object", properties: { tag: { $ref: "#/components/schemas/Tag" } } } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Tag not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Tags"],
          summary: "Delete a tag (admin)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Tag deleted." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Tag not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/tags/{slug}/posts": {
        get: {
          tags: ["Tags"],
          summary: "Get posts by tag",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string", example: "typescript" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Posts for the given tag with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            404: { description: "Tag not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── CATEGORIES ────────────────────────────────────────────────────────
      "/categories": {
        get: {
          tags: ["Categories"],
          summary: "Get all categories",
          responses: {
            200: {
              description: "Categories list.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { categories: { type: "array", items: { $ref: "#/components/schemas/Category" } } },
                  },
                },
              },
            },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Create a category (admin)",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "Technology" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Category created.", content: { "application/json": { schema: { type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } } } } },
            400: { description: "Validation error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Category already exists.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/categories/{slug}": {
        patch: {
          tags: ["Categories"],
          summary: "Update a category (admin)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "technology" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "Tech" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Category updated.", content: { "application/json": { schema: { type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } } } } },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Category not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Delete a category (admin)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Category deleted." },
            401: { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden. Admin only.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Category not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/categories/{slug}/posts": {
        get: {
          tags: ["Categories"],
          summary: "Get posts by category",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string", example: "technology" } },
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: {
              description: "Posts for the given category with pagination.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            404: { description: "Category not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
