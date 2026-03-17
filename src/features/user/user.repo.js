import { BaseRepo } from "../../base/BaseRepo.js";
import UserModel from "./user.model.js";
export class UserRepo extends BaseRepo {
  constructor() { super(UserModel); }
  async findByEmail(email) { return await this.model.findOne({ email, silindi_mi: false }); }
}
