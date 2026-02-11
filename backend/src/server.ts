import mongoose from "mongoose";
import { app } from "./apps";
import { env } from "./config/env";

async function start() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(env.PORT, () => {
      console.log(`✅ Server running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

start();
