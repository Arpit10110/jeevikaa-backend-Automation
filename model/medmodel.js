import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); 

const medDB = mongoose.createConnection((process.env.MongodB_Url), {
  dbName: "medicine",
});

medDB.on("connected", () => {
  console.log("✅ Connected to Medicine DB");
});

medDB.on("error", (err) => {
  console.error("❌ Medicine DB connection error:", err);
});

const Schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  price: String,
  is_discontinued: { type: String, default: "FALSE" },
  manufacturer_name: String,
  type: String,
  pack_size_label: String,
  short_composition1: String,
  short_composition2: String, 
  createdAt: { type: Date, default: Date.now },
});

export const MedModel = medDB.model("MedModel", Schema);
