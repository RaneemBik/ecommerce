import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: requireEnv("MONGO_URI"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES: process.env.JWT_EXPIRES ?? "7d"
};
