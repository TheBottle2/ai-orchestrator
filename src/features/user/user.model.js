import mongoose from "mongoose";
import { baseSchemaFields, baseSchemaOptions } from "../../base/BaseModel.js";

const userSchema = new mongoose.Schema(
  {
    ...baseSchemaFields,
    email: { type: String, required: true, unique: true, lowercase: true },
    sifre: { type: String, required: true },
    rol:   { type: String, enum: ["kullanici", "admin"], default: "kullanici" },
  },
  baseSchemaOptions
);

export default mongoose.models.User || mongoose.model("User", userSchema);
