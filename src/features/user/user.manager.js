import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BaseManager } from "../../base/BaseManager.js";
import { UserRepo } from "./user.repo.js";
import { config } from "../../core/config.js";
import { toUserDTO } from "./dto/user.dto.js";

const repo = new UserRepo();

export class UserManager extends BaseManager {
  constructor() {
    super(repo);
  }

  async register(userData) {
    const mevcutKullanici = await this.repo.findByEmail(userData.email);
    if (mevcutKullanici) throw new Error("Bu e-posta adresi zaten kayıtlı.");

    const hashedSifre = await bcrypt.hash(userData.sifre, 12);

    const yeniKullanici = await this.repo.create({
      ad:    userData.ad,
      email: userData.email,
      sifre: hashedSifre,
    });

    const token = this._tokenUret(yeniKullanici._id);
    return { kullanici: toUserDTO(yeniKullanici), token };
  }

  async login(email, sifre) {
    const kullanici = await this.repo.findByEmail(email);
    if (!kullanici) throw new Error("E-posta veya şifre hatalı.");

    const sifreEslesir = await bcrypt.compare(sifre, kullanici.sifre);
    if (!sifreEslesir) throw new Error("E-posta veya şifre hatalı.");

    const token = this._tokenUret(kullanici._id);
    return { kullanici: toUserDTO(kullanici), token };
  }

  _tokenUret(kullaniciId) {
    return jwt.sign({ id: kullaniciId }, config.jwtSecret, { expiresIn: "7d" });
  }
}
