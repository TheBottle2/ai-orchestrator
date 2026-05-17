import { z } from "zod";
// Sohbet icin API dogrulama semalari

export const ChatCreateSchema = z.object({
  baslik:       z.string().optional(),
  models: z.object({
    model1: z.string().min(1, "model1 gerekli"),
    model2: z.string().min(1, "model2 gerekli"),
    model3: z.string().min(1, "model3 gerekli"),
  }).optional(),
});

export const MessageSendSchema = z.object({
  mesaj: z.string().min(1, "Mesaj boş olamaz"),
  baslik: z.string().min(1).optional(),
});
