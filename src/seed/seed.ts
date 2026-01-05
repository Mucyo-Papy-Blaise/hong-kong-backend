import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { connectDB } from "../config/database";

/**
 * Seed script to create only admin and regular users
 * Run with: npm run seed
 */
async function seed() {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to database.");

    // Clear existing users
    console.log("Clearing existing users...");
    await User.deleteMany({});

    // Create default admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123", 10);
    await User.create({
      name: "Admin User",
      email: process.env.ADMIN_DEFAULT_EMAIL || "admin@eyewear.com",
      image: "https://res.cloudinary.com/dcg62af7v/image/upload/v1762683162/eyewear/image/ujfy4ejfkm19csh3g0st.jpg",
      password: adminPassword,
      role: "admin",
    });
    console.log(
      `Admin created: ${process.env.ADMIN_DEFAULT_EMAIL || "admin@eyewear.com"} / ${process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123"}`
    );

    // Create sample users
    const userPassword = await bcrypt.hash("user123", 10);
    await User.create([
      {
        name: "John Doe",
        email: "john@example.com",
        image: "https://res.cloudinary.com/dcg62af7v/image/upload/v1762683162/eyewear/image/ujfy4ejfkm19csh3g0st.jpg",
        password: userPassword,
        role: "user",
      }
    ]);
    console.log("Sample users created:");
    console.log("Email: john@example.com | Password: user123");

    console.log("\n✅ User seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seed();
