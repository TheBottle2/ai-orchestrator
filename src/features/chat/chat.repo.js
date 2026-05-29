import { BaseRepo } from "../../base/BaseRepo.js";
import ChatModel from "./chat.model.js";

export class ChatRepo extends BaseRepo {
  constructor() {
    super(ChatModel);
  }

  // Tek bir sohbet kaydini getirir
  async getById(chatId) {
    return await this.get_one(chatId);
  }

  // Kullaniciya ait sohbetleri sayfalar (liste/arama ekranlari icin)
  async getAllPaginated({ kullanici_id, page = 1, limit = 10 }) {
    return await this.get_many({
      filters: { kullanici_id },
      sortBy: "degistirilme_tarihi",
      sortOrder: -1,
      page,
      limit
    });
  }

  // Kullaniciya ait sohbetlerin basliklarini getirir (turlar dahil edilmez)
  async findByUser(kullanici_id) {
    return await this.model
      .find({ kullanici_id, silindi_mi: false })
      .select("-turlar")
      .sort({ degistirilme_tarihi: -1 });
  }

  // Sohbete yeni mesaj turu ekler
async addMessage(chatId, tur) {
return await this.model.findByIdAndUpdate(
chatId,
{ $push: { turlar: tur }, $set: { degistirilme_tarihi: new Date() } },
{ returnDocument: "after" }
);
}

  async updateChat(chatId, data) {
    return await this.patch(chatId, data);
  }

  async deleteChat(chatId) {
    return await this.soft_delete(chatId);
  }
}
