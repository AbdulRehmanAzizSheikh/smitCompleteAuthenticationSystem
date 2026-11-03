import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { User } from "./models/User";
import { getSession } from "./session";

/**
 * Data Access Layer — centralizes auth checks and returns a
 * Data Transfer Object (never the mongoose document itself).
 */

export interface CurrentUserDTO {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export const getCurrentUser = cache(async (): Promise<CurrentUserDTO | null> => {
  const session = await getSession();
  if (!session) return null;
  if (!Types.ObjectId.isValid(session.userId)) return null;

  try {
    await connectDB();
    const user = await User.findById(session.userId)
      .select("username displayName email createdAt")
      .lean<{ _id: Types.ObjectId; username: string; displayName: string; email: string; createdAt: Date }>();

    if (!user) return null;

    return {
      id: String(user._id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
    };
  } catch (error) {
    console.error("[dal] getCurrentUser failed:", error);
    return null;
  }
});

export const requireUser = cache(async (): Promise<CurrentUserDTO> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});
