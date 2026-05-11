export const config = {
  // .env.local dosyasından okur, yoksa varsayılan değerleri kullanır // Merkezi yapılandırma dosyası - Tüm ortam değişkenleri ve AI modelleri burada tanımlı
  // MongoDB bağlantı adresi (.env.local'den okunur)
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "degistir-beni", // JWT token imzalama anahtarı - Güvenlik için kullanılır
  // Uygulama ortamı: development (hata ayıklama açık), production (optimize), test
  nodeEnv: process.env.NODE_ENV || "development",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434", // Ollama AI sunucu URL'i - Yerel AI modelleri için

  // Optimizasyonlar
  maxTokens: parseInt(process.env.MAX_TOKENS) || 128,
  temperature: parseFloat(process.env.TEMPERATURE) || 0.6,

  models: {
    model1: {
      id: process.env.LM_MODEL_1 || "qwen2.5:1.5b", // Yanıtlayıcı (Hızlı)
      rol: "Yanıtlayıcı",
      sistem: "Soruyu doğrudan yanıtla, açık ve net ol. Konuşma dili kullan. Ek açıklama yapma.",
    },
    model2: {
      id: process.env.LM_MODEL_2 || "qwen2.5:3b", // Eleştirmen (Dengeli)
      rol: "Eleştirmen",
      sistem: "İLK YANITI OKU. Yanıtın eksik/yanlış noktalarını 1-2 cümleyle belirt. Asla soruyu tekrar etme.",
    },
    model3: {
      id: process.env.LM_MODEL_3 || "llama3.2:3b", // Sentezci (Kaliteli)
      rol: "Sentezci",
      sistem: "YANIT VE ELEŞTİRİYİ OKU. Tek paragraflık, doğal bir yanıt oluştur. Tekrar yapma, özgün ol.",
    },
  },
};
