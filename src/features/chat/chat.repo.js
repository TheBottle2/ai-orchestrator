import { BaseRepo } from "../../base/BaseRepo.js";
import ChatModel from "./chat.model.js";

export class ChatRepo extends BaseRepo {
  constructor() {
    super(ChatModel);
  }

  async findByUser(kullanici_id) {
    return await this.model
      .find({ kullanici_id, silindi_mi: false })
      .select("-mesajlar")
      .sort({ degistirilme_tarihi: -1 });
  }

  async addMessage(chatId, mesaj) {
    return await this.model.findByIdAndUpdate(
      chatId,
      { $push: { mesajlar: mesaj } },
      { new: true }
    );
  }
}
