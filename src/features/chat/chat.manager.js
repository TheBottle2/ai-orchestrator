import { BaseManager } from "../../base/BaseManager.js";
import { ChatRepo } from "./chat.repo.js";
import { config } from "../../core/config.js";

const repo = new ChatRepo();
const LM_URL = `${config.lmStudioBaseUrl}/v1/chat/completions`;

export class ChatManager extends BaseManager {
  constructor() {
    super(repo);
  }

  async createSession(kullanici_id, baslik) {
    return await this.repo.create({
      ad: baslik || "Yeni Sohbet",
      kullanici_id,
      mesajlar: [],
    });
  }

  async getSessions(kullanici_id) {
    return await this.repo.findByUser(kullanici_id);
  }

  async sendMessage(chatId, kullaniciSorusu) {
    const baslangic = Date.now();

    const adim1 = await this._modelCagir(config.models.model1, [
      { role: "system", content: config.models.model1.sistem },
      { role: "user",   content: kullaniciSorusu },
    ]);

    const adim2 = await this._modelCagir(config.models.model2, [
      { role: "system", content: config.models.model2.sistem },
      { role: "user",   content: `Soru: ${kullaniciSorusu}\n\nYanıt:\n${adim1.icerik}` },
    ]);

    const adim3 = await this._modelCagir(config.models.model3, [
      { role: "system", content: config.models.model3.sistem },
      { role: "user",   content: `Soru: ${kullaniciSorusu}\n\nYanıt:\n${adim1.icerik}\n\nEleştiri:\n${adim2.icerik}` },
    ]);

    const toplamSure = Date.now() - baslangic;

    await this.repo.addMessage(chatId, {
      kullanici_sorusu: kullaniciSorusu,
      pipeline: { model1: adim1, model2: adim2, model3: adim3 },
      final_yanit: adim3.icerik,
      toplam_sure_ms: toplamSure,
      durum: "tamamlandi",
    });

    return {
      final_yanit:    adim3.icerik,
      pipeline:       { model1: adim1, model2: adim2, model3: adim3 },
      toplam_sure_ms: toplamSure,
    };
  }

  async _modelCagir(modelConfig, messages) {
    const baslangic  = Date.now();
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await fetch(LM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model:       modelConfig.id,
          messages,
          temperature: 0.7,
          max_tokens:  256,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model hatası: ${modelConfig.id} — HTTP ${response.status}`);
      }

      const data   = await response.json();
      const ham    = data.choices?.[0]?.message?.content || "";
      const icerik = this._temizle(ham);

      return {
        model_id: modelConfig.id,
        rol:      modelConfig.rol,
        icerik,
        sure_ms:  Date.now() - baslangic,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  _temizle(text) {
    if (!text) return "";
    return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }
}
