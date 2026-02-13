import "./config/env.js";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { prisma } from "./config/db.js";

const PORT = ENV.PORT;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
