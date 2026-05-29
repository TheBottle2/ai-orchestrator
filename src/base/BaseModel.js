// Ortak Mongoose şema alanları - Tüm feature'ların miras aldığı temel alanlar
export const baseSchemaFields = {
ad: { type: String, required: true },
aktif_mi: { type: Boolean, default: true },
silindi_mi: { type: Boolean, default: false },
};

export const baseSchemaOptions = {
timestamps: {
createdAt: "olusturulma_tarihi",
updatedAt: "degistirilme_tarihi",
},
};
