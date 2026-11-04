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
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  mode: "auto" | "rotate" | "fixed";
  layout: "layout-1" | "layout-2" | "layout-3";
  buttons: "buttons-1" | "buttons-2" | "buttons-3" | "buttons-4" | "buttons-5";
  icons: "icons-1" | "icons-2" | "icons-3" | "icons-4" | "icons-5";
  createdAt: string;
}

export const getCurrentUser = cache(async (): Promise<CurrentUserDTO | null> => {
  const session = await getSession();
  if (!session) return null;
  if (!Types.ObjectId.isValid(session.userId)) return null;

  try {
    await connectDB();
    const user = await User.findById(session.userId)
      .select("username displayName email theme mode layout buttons icons createdAt")
      .lean<{
        _id: Types.ObjectId;
        username: string;
        displayName: string;
        email: string;
        theme?: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
        mode?: "auto" | "rotate" | "fixed";
        layout?: "layout-1" | "layout-2" | "layout-3";
        buttons?: "buttons-1" | "buttons-2" | "buttons-3" | "buttons-4" | "buttons-5";
        icons?: "icons-1" | "icons-2" | "icons-3" | "icons-4" | "icons-5";
        createdAt: Date;
      }>();

    if (!user) return null;

    return {
      id: String(user._id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      theme: user.theme ?? "theme-1",
      mode: user.mode ?? "auto",
      layout: user.layout ?? "layout-1",
      buttons: user.buttons ?? "buttons-1",
      icons: user.icons ?? "icons-1",
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
