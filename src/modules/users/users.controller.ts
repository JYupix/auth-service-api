import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { updateUserSchema } from "./users.schemas.js";
import { Prisma } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";
import { logAction } from "../../config/logger.js";

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  if (!search) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  const where = {
    deletedAt: null,
    OR: [
      { username: { contains: search, mode: "insensitive" as const } },
      { name: { contains: search, mode: "insensitive" as const } },
    ],
  };

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
      },
      take: limit,
      skip: skip,
    }),
    prisma.user.count({ where }),
  ]);

  logAction("users.search", { search, page, limit });
  res.status(200).json({
    users,
    pagination: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      hasMore: skip + limit < totalUsers,
    },
  });
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const [
    totalPosts,
    totalComments,
    followersCount,
    followingCount,
    posts,
    totalUserPosts,
  ] = await Promise.all([
    prisma.post.count({
      where: { authorId: user.id, published: true, deletedAt: null },
    }),
    prisma.comment.count({
      where: { authorId: user.id, deletedAt: null },
    }),
    prisma.follow.count({
      where: { followingId: user.id },
    }),
    prisma.follow.count({
      where: { followerId: user.id },
    }),
    prisma.post.findMany({
      where: { authorId: user.id, published: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({
      where: { authorId: user.id, published: true, deletedAt: null },
    }),
  ]);

  const totalLikesReceived = posts.reduce(
    (sum, post) => sum + post._count.likes,
    0,
  );

  logAction("users.view_profile", { username });
  res.status(200).json({
    user,
    stats: {
      totalPosts,
      totalComments,
      totalLikesReceived,
      followersCount,
      followingCount,
    },
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    })),
    pagination: {
      page,
      limit,
      total: totalUserPosts,
      totalPages: Math.ceil(totalUserPosts / limit),
      hasMore: skip + limit < totalUserPosts,
    },
  });
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      emailVerified: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const [
    totalPosts,
    draftsCount,
    totalComments,
    followersCount,
    followingCount,
    posts,
    totalMyPosts,
  ] = await Promise.all([
    prisma.post.count({
      where: { authorId: userId, deletedAt: null },
    }),
    prisma.post.count({
      where: { authorId: userId, published: false, deletedAt: null },
    }),
    prisma.comment.count({
      where: { authorId: userId, deletedAt: null },
    }),
    prisma.follow.count({
      where: { followingId: user.id },
    }),
    prisma.follow.count({
      where: { followerId: user.id },
    }),

    prisma.post.findMany({
      where: { authorId: userId, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({
      where: { authorId: userId, deletedAt: null },
    }),
  ]);

  const totalLikesReceived = posts.reduce(
    (sum, post) => sum + post._count.likes,
    0,
  );

  logAction("users.my_profile", { userId });
  res.status(200).json({
    user,
    stats: {
      totalPosts,
      draftsCount,
      totalComments,
      totalLikesReceived,
      followersCount,
      followingCount,
    },
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      published: post.published,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    })),
    pagination: {
      page,
      limit,
      total: totalMyPosts,
      totalPages: Math.ceil(totalMyPosts / limit),
      hasMore: skip + limit < totalMyPosts,
    },
  });
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId as string;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { name, bio, profileImage } = updateUserSchema.parse(req.body);

  const data: Prisma.UserUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (profileImage !== undefined) data.profileImage = profileImage;

  const updatedUser = await prisma.user.update({
    where: { id: userId, deletedAt: null },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      emailVerified: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  });

  logAction("user.update_profile", { userId });
  res.status(200).json({ user: updatedUser });
};

export const toggleFollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId as string;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const usernameToFollow = req.params.username as string;

  const userToFollow = await prisma.user.findUnique({
    where: { username: usernameToFollow, deletedAt: null },
  });

  if (!userToFollow) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (userToFollow.id === userId) {
    res.status(400).json({ message: "You cannot follow yourself" });
    return;
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: userToFollow.id,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    logAction("user.unfollow", { userId, target: usernameToFollow });
    res.status(200).json({ message: `Unfollowed ${usernameToFollow}` });
    return;
  }

  await prisma.follow.create({
    data: {
      followerId: userId,
      followingId: userToFollow.id,
    },
  });

  logAction("user.follow", { userId, target: usernameToFollow });
  res.status(201).json({ message: `Followed ${usernameToFollow}` });
};

export const getFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const [followers, totalFollowers] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: user.id },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.follow.count({
      where: { followingId: user.id },
    }),
  ]);

  logAction("users.followers", { username, page, limit });
  res.json({
    followers: followers.map((f) => f.follower),
    pagination: {
      page,
      limit,
      total: totalFollowers,
      totalPages: Math.ceil(totalFollowers / limit),
      hasMore: skip + limit < totalFollowers,
    },
  });
};

export const getFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const [following, totalFollowing] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: user.id },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.follow.count({
      where: { followerId: user.id },
    }),
  ]);

  logAction("users.following", { username, page, limit });
  res.status(200).json({
    following: following.map((f) => f.following),
    pagination: {
      page,
      limit,
      total: totalFollowing,
      totalPages: Math.ceil(totalFollowing / limit),
      hasMore: skip + limit < totalFollowing,
    },
  });
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const username = req.params.username as string;
  const { name, bio, profileImage } = updateUserSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const data: Prisma.UserUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (profileImage !== undefined) data.profileImage = profileImage;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      profileImage: true,
      role: true,
      createdAt: true,
    },
  });

  logAction("admin.update_user", { adminId: req.user?.userId, target: username });
  res.status(200).json({ user: updatedUser });
};

export const deleteUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const username = req.params.username as string;
  const userId = req.user?.userId as string;

  const user = await prisma.user.findUnique({
    where: { username, deletedAt: null },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.id === userId) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date() },
  });

  logAction("admin.delete_user", { adminId: userId, target: username });
  res.status(200).json({ message: "User deleted successfully" });
};

export const uploadProfilePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { profileImageId: true },
    });

    if (user?.profileImageId) {
      await cloudinary.uploader.destroy(user.profileImageId);
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "blog-platform/profiles",
      resource_type: "auto",
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
      ],
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: result.secure_url,
        profileImageId: result.public_id,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        profileImage: true,
        bio: true,
      },
    });
    logAction("user.upload_photo", { userId });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error uploading profile photo" });
  }
};
