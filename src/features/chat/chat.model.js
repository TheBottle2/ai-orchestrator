import mongoose from "mongoose";
// Sohbet veri modeli: turlar, pipeline ve model secimleri
import { baseSchemaFields, baseSchemaOptions } from "../../base/BaseModel.js";

const adimSchema = new mongoose.Schema(
{
model_id: { type: String },
rol: { type: String },
icerik: { type: String },
sure_ms: { type: Number },
},
{ _id: false }
);

const turSchema = new mongoose.Schema({
kullanici_mesaji: { type: String },
pipeline: { type: [adimSchema] },
final_cevap: { type: String },
tarih: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
{
...baseSchemaFields,
kullanici_id: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},
models: {
model1: { type: String },
model2: { type: String },
model3: { type: String },
},
turlar: { type: [turSchema], default: [] },
},
baseSchemaOptions
);

chatSchema.index({ kullanici_id: 1, silindi_mi: 1, degistirilme_tarihi: -1 });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
