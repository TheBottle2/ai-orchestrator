import { z } from "zod";
export const ChatCreateSchema  = z.object({ baslik: z.string().optional() });
export const MessageSendSchema = z.object({ mesaj: z.string().min(1) });
