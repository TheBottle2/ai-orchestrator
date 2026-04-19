import { z } from "zod";

export const ChatCreateSchema = z.object({
  kullanici_id: z.string().min(1, "kullanici_id gerekli"),
  baslik:       z.string().optional(),
});

export const MessageSendSchema = z.object({
  mesaj: z.string().min(1, "Mesaj boş olamaz"),
});
