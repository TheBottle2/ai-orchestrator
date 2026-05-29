// Merkezi yapılandırma dosyası - Tüm ortam değişkenleri ve AI modelleri burada tanımlı
export const config = {
mongoUri: process.env.MONGODB_URI,
jwtSecret: (() => {
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET tanımlanmamış. .env.local dosyasını kontrol et.");
return secret;
})(),
nodeEnv: process.env.NODE_ENV || "development",
ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",

maxTokens: parseInt(process.env.MAX_TOKENS, 10) ?? 128,
temperature: parseFloat(process.env.TEMPERATURE) ?? 0.6,

  models: {
    model1: {
      id: process.env.LM_MODEL_1 || "qwen2.5:1.5b", // Yanıtlayıcı (Hızlı)
      rol: "Yanıtlayıcı",
      sistem: "Soruyu dogrudan yanitla. Kisa, net, gunluk dil kullan. Varsayim yapma. Bilgi eksikse tek bir net soru sor. Metin disi aciklama yapma.",
    },
    model2: {
      id: process.env.LM_MODEL_2 || "qwen2.5:3b", // Eleştirmen (Dengeli)
      rol: "Eleştirmen",
      sistem: "Ilk yaniti oku. Eksik veya hatali noktayi 1-2 cumlede belirt. Soru tekrar etme. Oneri yapma, sadece tespit et.",
    },
    model3: {
      id: process.env.LM_MODEL_3 || "llama3.2:3b", // Sentezci (Kaliteli)
      rol: "Sentezci",
      sistem: "Yanit ve elestiriyi oku. Tek paragrafta final cevabi yaz. Varsayim yapma, ogretici meta anlatim kullanma. Yalnizca cevap ver.",
    },
  },
};
