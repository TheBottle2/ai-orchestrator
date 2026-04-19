import { BaseRepo } from "../../base/BaseRepo.js";
import ChatModel from "./chat.model.js";

export class ChatRepo extends BaseRepo {
  constructor() {
    super(ChatModel);
  }

  async getById(chatId) {
    return await this.get_one(chatId);
  }

  async getAllPaginated({ kullanici_id, page = 1, limit = 10 }) {
    return await this.get_many({
      filters: { kullanici_id },
      sortBy: "degistirilme_tarihi",
      sortOrder: -1,
      page,
      limit
    });
  }

  async findByUser(kullanici_id) {
    return await this.model
      .find({ kullanici_id, silindi_mi: false })
      .select("-turlar")
      .sort({ degistirilme_tarihi: -1 });
  }

  async addMessage(chatId, tur) {
    return await this.model.findByIdAndUpdate(
      chatId,
      { $push: { turlar: tur } },
      { new: true }
    );
  }

  async updateChat(chatId, data) {
    return await this.patch(chatId, data);
  }

  async deleteChat(chatId) {
    return await this.soft_delete(chatId);
  }
}