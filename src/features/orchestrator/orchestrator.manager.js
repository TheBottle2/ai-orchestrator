// Pipeline: Yanitci -> Elestirmen -> Sentezci
import { config } from "../../core/config.js";
export class OrchestratorManager {
  async _call(key, messages) {
    const m = config.models[key], t = Date.now();
    const res = await fetch(config.lmStudioUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: m.id, messages: [{ role: "system", content: m.system }, ...messages], temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(`${m.label} hata: ${res.status}`);
    const raw   = (await res.json()).choices?.[0]?.message?.content || "";
    const cikti = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return { cikti, sure_ms: Date.now() - t, model_id: m.id, model_label: m.label };
  }
  async run(soru) {
    const adimlar = [];
    // Adim 1
    const a1 = await this._call("answerer", [{ role: "user", content: soru }]);
    adimlar.push({ rol: "answerer", ...a1, girdi: soru });
    // Adim 2
    const g2 = `Soru: "${soru}"\nCevap: "${a1.cikti}"\nBu cevabi elestir.`;
    const a2 = await this._call("critic", [{ role: "user", content: g2 }]);
    adimlar.push({ rol: "critic", ...a2, girdi: g2 });
    // Adim 3
    const g3 = `Soru: "${soru}"\nIlk cevap: "${a1.cikti}"\nElestiri: "${a2.cikti}"\nBunlari birlestirip final cevabi yaz.`;
    const a3 = await this._call("synthesizer", [{ role: "user", content: g3 }]);
    adimlar.push({ rol: "synthesizer", ...a3, girdi: g3 });
    return { adimlar, final_cevap: a3.cikti };
  }
}
