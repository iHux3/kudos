import { z } from 'zod';
import { KUDOS_CATEGORIES } from '../types/kudos';

export const SenderIdHeaderSchema = z.object({
  senderId: z.uuid(),
});

export const CreateKudosBodySchema = z.object({
  receiverId: z.uuid(),
  message: z.string().trim().min(1).max(500),
  category: z.enum(KUDOS_CATEGORIES),
});

export const ListKudosQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const KudosDtoSchema = z.object({
  id: z.uuid(),
  senderId: z.uuid(),
  receiverId: z.uuid(),
  message: z.string(),
  category: z.enum(KUDOS_CATEGORIES),
  createdAt: z.iso.datetime(),
});

export type SenderIdHeaderDto = z.infer<typeof SenderIdHeaderSchema>;
export type CreateKudosBodyDto = z.infer<typeof CreateKudosBodySchema>;
export type ListKudosQueryDto = z.infer<typeof ListKudosQuerySchema>;
export type KudosDto = z.infer<typeof KudosDtoSchema>;
