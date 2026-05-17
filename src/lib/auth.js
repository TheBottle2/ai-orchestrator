import jwt from "jsonwebtoken";
// Token dogrulama yardimcisi
import { config } from "../core/config.js";

export function getAuthUserId(req) {
  try {
    const header = req.headers.get("authorization") || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      const err = new Error("Yetkisiz");
      err.status = 401;
      throw err;
    }

    const payload = jwt.verify(token, config.jwtSecret);
    return payload.id;
  } catch {
    const err = new Error("Yetkisiz");
    err.status = 401;
    throw err;
  }
}
