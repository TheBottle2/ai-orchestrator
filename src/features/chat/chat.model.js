import mongoose from "mongoose";
import { baseSchemaFields, baseSchemaOptions } from "../../base/BaseModel.js";

// Pipeline adımı — tek bir modelin girdi/çıktısını tutar
const adimSchema = new mongoose.Schema(
  {
    model_id:    { type: String },
    model_label: { type: String },
    rol:         { type: String, enum: ["answerer", "critic", "synthesizer"] },
    girdi:       { type: String },
    cikti:       { type: String },
    sure_ms:     { type: Number },
  },
  { _id: false }
);

// Tur — kullanıcının bir sorusu ve o soruya ait pipeline sonuçları
const turSchema = new mongoose.Schema({
  kullanici_mesaji: { type: String },
  pipeline:         { type: [adimSchema] },
  final_cevap:      { type: String },
  tarih:            { type: Date, default: Date.now },
});

// Sohbet oturumu — bir kullanıcıya ait tüm turları içerir
const chatSchema = new mongoose.Schema(
  {
    ...baseSchemaFields,
    kullanici_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    turlar: { type: [turSchema], default: [] },
  },
  baseSchemaOptions
);

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
