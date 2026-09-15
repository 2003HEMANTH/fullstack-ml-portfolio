/**
 * Seed Admin Script
 *
 * Creates (or updates) a single admin user from environment variables.
 * Usage:  ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run seed:admin
 *
 * Safe to run multiple times — uses upsert so it never creates duplicates.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌  ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.");
    process.exit(1);
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const result = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {
            $set: {
                password: hashedPassword,
                role: "admin",
            },
            $setOnInsert: {
                name: "Admin",
                email: ADMIN_EMAIL,
            },
        },
        { upsert: true, new: true },
    );

    console.log(`✅  Admin user ready — ${result.email} (${result._id})`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
});
