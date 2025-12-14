import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { User } from "../models/User";

dotenv.config();

async function migrateUsersSnakeToCamel() {
  try {
    await connectDB();

    console.log("Starting users migration (snake_case -> camelCase)...");

    // poišči userje, ki imajo stara polja
    const users = await User.find({
      $or: [{ first_name: { $exists: true } }, { last_name: { $exists: true } }],
    }).lean();

    console.log(`Found ${users.length} users to migrate.`);

    for (const u of users) {
      const set: any = {};
      const unset: any = {};

      if ((u as any).first_name && !u.firstName) {
        set.firstName = (u as any).first_name;
        unset.first_name = "";
      }

      if ((u as any).last_name && !u.lastName) {
        set.lastName = (u as any).last_name;
        unset.last_name = "";
      }

      if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
        continue;
      }

      await User.updateOne(
        { _id: u._id },
        {
          ...(Object.keys(set).length ? { $set: set } : {}),
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
        }
      );
    }

    console.log("Users migration finished.");
    process.exit(0);
  } catch (err) {
    console.error("Users migration error:", err);
    process.exit(1);
  }
}

migrateUsersSnakeToCamel();
