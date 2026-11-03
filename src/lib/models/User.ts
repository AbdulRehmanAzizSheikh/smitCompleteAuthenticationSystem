import { Schema, model, models } from "mongoose";

export interface IUser {
  username: string;
  displayName: string;
  email: string;
  password: string;
  theme: "theme-1" | "theme-2" | "theme-3";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be at most 20 characters"],
      match: [/^[a-z0-9_]+$/, "Username may only contain lowercase letters, numbers and underscores"],
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [50, "Display name must be at most 50 characters"],
      default: function (this: IUser) {
        return this.username;
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // never return password by default
    },
    theme: {
      type: String,
      enum: ["theme-1", "theme-2", "theme-3"],
      default: "theme-1",
    },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", userSchema);
