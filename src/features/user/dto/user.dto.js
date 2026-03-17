import { z } from "zod";

export const UserCreateSchema = z.object({
  ad:    z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().min(1, "E-posta gerekli"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const UserLoginSchema = z.object({
  email: z.string().min(1, "E-posta gerekli"),
  sifre: z.string().min(1, "Şifre gerekli"),
});

export const toUserDTO = (user) => ({
  id:                 user._id,
  ad:                 user.ad,
  email:              user.email,
  rol:                user.rol,
  aktif_mi:           user.aktif_mi,
  olusturulma_tarihi: user.olusturulma_tarihi,
});
