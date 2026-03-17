export const config = {
  mongoUri:        process.env.MONGODB_URI,
  jwtSecret:       process.env.JWT_SECRET || "degistir-beni",
  nodeEnv:         process.env.NODE_ENV || "development",
  lmStudioBaseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234",

  models: {
    model1: {
      id:     process.env.LM_MODEL_1 || "qwen/qwen3-1.7b",
      rol:    "Yanıtlayıcı",
      sistem: "Soruyu kısa ve net yanıtla. Sadece yanıtı yaz.",
    },
    model2: {
      id:     process.env.LM_MODEL_2 || "mistralai/ministral-3-3b",
      rol:    "Eleştirmen",
      sistem: "Verilen yanıtın eksiklerini ve hatalarını 2-3 cümleyle belirt.",
    },
    model3: {
      id:     process.env.LM_MODEL_3 || "liquid/lfm2-1.2b",
      rol:    "Sentezci",
      sistem: "İlk yanıt ve eleştiriyi birleştirerek tek bir final yanıt yaz.",
    },
  },
};
