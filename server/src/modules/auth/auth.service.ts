// Auth Service — User lookup and creation for OAuth
import { prisma } from "../../prisma/client.js";

export interface GoogleProfile {
  id: string; // Google sub
  email: string;
  displayName: string;
  photos?: { value: string }[];
}

/**
 * Find or create a user from a Google OAuth profile.
 * If the user exists but is deactivated, throws an error.
 */
export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const email = profile.email;

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check active status
    if (!user.isActive) {
      throw new AccountDisabledError(
        "Your account has been disabled. Contact the administrator.",
      );
    }

    // Update profile data if it changed
    user = await prisma.user.update({
      where: { email },
      data: {
        name: profile.displayName || user.name,
        image: profile.photos?.[0]?.value || user.image,
        providerId: profile.id,
      },
    });

    return user;
  }

  // Create new user
  return prisma.user.create({
    data: {
      email,
      name: profile.displayName || null,
      image: profile.photos?.[0]?.value || null,
      provider: "google",
      providerId: profile.id,
      isActive: true,
    },
  });
}

/**
 * Fetch a user by ID. Returns null if not found.
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

/**
 * Custom error for disabled accounts.
 */
export class AccountDisabledError extends Error {
  public statusCode = 403;
  public isOperational = true;
  constructor(message: string) {
    super(message);
    this.name = "AccountDisabledError";
  }
}
