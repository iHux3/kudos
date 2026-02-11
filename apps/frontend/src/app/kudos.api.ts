import {
  KudosDtoSchema,
  ListKudosResponseSchema,
  type KudosDto,
  type CreateKudosBodyDto,
  type ListKudosResponseDto,
} from '@kudos/shared';
import { z } from 'zod';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const DEMO_SENDER_ID = '11111111-1111-4111-8111-111111111111';
export const FEED_LIMIT = 20;
export const kudosQueryKey: readonly ['kudos', number, number] = [
  'kudos',
  FEED_LIMIT,
  0,
];

export type ListKudosResponse = ListKudosResponseDto;

export class ApiError extends Error {
  status?: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const createApiError = (status: number, message: string): ApiError => {
  return new ApiError(status, message);
};

const ErrorPayloadSchema = z
  .object({
    message: z.string().optional(),
  })
  .passthrough();

const parseErrorMessage = async (response: Response) => {
  const fallback = response.statusText || 'Request failed.';
  try {
    const parsed = ErrorPayloadSchema.safeParse(await response.json());
    return parsed.success ? (parsed.data.message ?? fallback) : fallback;
  } catch {
    return fallback;
  }
};

export const fetchKudos = async (): Promise<ListKudosResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/kudos?limit=${FEED_LIMIT}&offset=0`
  );
  if (!response.ok) {
    throw createApiError(response.status, await parseErrorMessage(response));
  }

  return ListKudosResponseSchema.parse(await response.json());
};

export const createKudos = async (
  payload: CreateKudosBodyDto
): Promise<KudosDto> => {
  const response = await fetch(`${API_BASE_URL}/kudos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEMO_SENDER_ID,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw createApiError(response.status, await parseErrorMessage(response));
  }

  return KudosDtoSchema.parse(await response.json());
};
