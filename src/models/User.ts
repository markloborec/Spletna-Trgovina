import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    deliveryAddress: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    password_hash: { type: String, required: true },
    is_admin: { type: Boolean, default: false },

    resetPasswordTokenHash: { type: String, default: undefined  },
    resetPasswordExpires: { type: Date, default: undefined  },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
