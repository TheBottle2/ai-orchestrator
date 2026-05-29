import jwt from "jsonwebtoken";
// Token dogrulama yardimcisi - JWT hatasi detaylarini korur
import { config } from "../core/config.js";

export function getAuthUserId(req) {
const header = req.headers.get("authorization") || "";
const [type, token] = header.split(" ");

if (type !== "Bearer" || !token) {
const err = new Error("Yetkisiz");
err.status = 401;
throw err;
}

try {
const payload = jwt.verify(token, config.jwtSecret);
return payload.id;
} catch (e) {
const err = new Error(
e.name === "TokenExpiredError"
? "Oturum süresi doldu. Lütfen tekrar giriş yapın."
: "Yetkisiz"
);
err.status = 401;
throw err;
}
}
