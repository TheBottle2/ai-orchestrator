import { BaseManager } from "../../base/BaseManager.js";
import { ChatRepo } from "./chat.repo.js";
import { config } from "../../core/config.js";

// Cache mekanizması için global değişken
const modelCache = new Map();
const repo = new ChatRepo();
const LM_URL = `${config.ollamaBaseUrl}/v1/chat/completions`;

export class ChatManager extends BaseManager {
  constructor() {
    super(repo);
  }

  // Yeni sohbet oturumu olusturur (veri MongoDB'ye yazilir)
  async createSession(kullanici_id, baslik, models) {
    return await this.repo.create({
      ad: baslik || "Yeni Sohbet",
      kullanici_id,
      models,
      turlar: [],
    });
  }

  // Tek sohbet kaydini getirir
  async getSession(chatId) {
    return await this.repo.getById(chatId);
  }

  // Kullaniciya ait tum sohbetleri listeler
  async getSessions(kullanici_id) {
    return await this.repo.findByUser(kullanici_id);
  }

  async getSessionsPaginated(kullanici_id, page, limit) {
    return await this.repo.getAllPaginated({ kullanici_id, page, limit });
  }

  async updateSession(chatId, yeniBaslik) {
    return await this.repo.updateChat(chatId, { ad: yeniBaslik });
  }

  async deleteSession(chatId) {
    return await this.repo.deleteChat(chatId);
  }

  // Mesaji 3 adimli pipeline'a gonderir ve sonucu kaydeder
  async sendMessage(chatId, kullaniciSorusu, baslik) {
    const baslangic = Date.now();

    const chat = await this.repo.getById(chatId);
    if (!chat) throw new Error("Sohbet bulunamadı.");

    if (baslik && chat.ad === "Yeni Sohbet") {
      await this.repo.updateChat(chatId, { ad: baslik });
      chat.ad = baslik;
    }

    const models = chat.models || {};
    const model1 = { ...config.models.model1, id: models.model1 || config.models.model1.id };
    const model2 = { ...config.models.model2, id: models.model2 || config.models.model2.id };
    const model3 = { ...config.models.model3, id: models.model3 || config.models.model3.id };

    const adim1 = await this._modelCagir(model1, [
      { role: "system", content: model1.sistem },
      { role: "user",   content: kullaniciSorusu },
    ]);

    const adim2 = await this._modelCagir(model2, [
      { role: "system", content: model2.sistem },
      { role: "user",   content: `Soru: ${kullaniciSorusu}\n\nYanıt:\n${adim1.icerik}` },
    ]);

    const adim3 = await this._modelCagir(model3, [
      { role: "system", content: model3.sistem },
      { role: "user",   content: `Soru: ${kullaniciSorusu}\n\nYanıt:\n${adim1.icerik}\n\nEleştiri:\n${adim2.icerik}` },
    ]);

    const toplamSure = Date.now() - baslangic;

    const tur = {
      kullanici_mesaji: kullaniciSorusu, 
      pipeline: [adim1, adim2, adim3],   
      final_cevap: adim3.icerik,       
    };

    await this.repo.addMessage(chatId, tur);

    return {
      final_yanit:    adim3.icerik,
      pipeline:       { model1: adim1, model2: adim2, model3: adim3 },
      toplam_sure_ms: toplamSure,
      baslik:         chat.ad,
    };
  }

  // Ollama'ya istek atar ve yaniti duzenler
  async _modelCagir(modelConfig, messages) {
    const cacheKey = modelConfig.id;
    const baslangic = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000); // 3 dakika

    try {
      const response = await fetch(LM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: modelConfig.id,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model hatası: ${modelConfig.id} — HTTP ${response.status}`);
      }

      const data = await response.json();
      const ham = data.choices?.[0]?.message?.content || "";
      const icerik = this._temizle(ham);

      // Cache'i guncelle (model son kullanimi)
      modelCache.set(cacheKey, { lastUsed: Date.now() });

      return {
        model_id: modelConfig.id,
        rol: modelConfig.rol,
        icerik,
        sure_ms: Date.now() - baslangic,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // Model ciktilarindaki dusunce bloklarini temizler
  _temizle(text) {
    if (!text) return "";
    return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }
}
