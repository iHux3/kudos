import type { CreateKudosBodyDto, KudosDto, KudosCategory } from '@kudos/shared';
import { desc } from 'drizzle-orm';
import { db } from './client';
import { kudosTable } from './schema';

type CreateKudosInput = CreateKudosBodyDto & { senderId: string };
type ListKudosInput = { limit: number; offset: number };

const mapRowToKudosDto = (row: typeof kudosTable.$inferSelect): KudosDto => ({
  id: row.id,
  senderId: row.senderId,
  receiverId: row.receiverId,
  message: row.message,
  category: row.category as KudosCategory,
  createdAt: row.createdAt.toISOString(),
});

export const createKudos = async (input: CreateKudosInput): Promise<KudosDto> => {
  const [created] = await db
    .insert(kudosTable)
    .values({
      senderId: input.senderId,
      receiverId: input.receiverId,
      message: input.message,
      category: input.category,
    })
    .returning();

  return mapRowToKudosDto(created);
};

export const listKudos = async ({ limit, offset }: ListKudosInput): Promise<KudosDto[]> =>
  (
    await db
      .select()
      .from(kudosTable)
      .orderBy(desc(kudosTable.createdAt))
      .limit(limit)
      .offset(offset)
  ).map(mapRowToKudosDto);
