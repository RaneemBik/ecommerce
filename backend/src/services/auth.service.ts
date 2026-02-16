import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { env } from "../config/env";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existing = await User.findOne({ email });
  if (existing) {
    const err: any = new Error("Email already in use");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
    isAdmin: true
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { sub: user._id.toString(), isAdmin: user.isAdmin },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES as jwt.SignOptions["expiresIn"] }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  };
}
