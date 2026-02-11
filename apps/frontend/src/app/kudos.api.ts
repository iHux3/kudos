import type { KudosDto, CreateKudosBodyDto } from '@kudos/shared';

declare global {
  interface Window {
    __KUDOS_API_URL__?: string;
  }
}

const runtimeApiUrl =
  typeof window === 'undefined' ? undefined : window.__KUDOS_API_URL__;

export const API_BASE_URL =
  runtimeApiUrl ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const DEMO_SENDER_ID = '11111111-1111-4111-8111-111111111111';
export const FEED_LIMIT = 20;
export const kudosQueryKey = ['kudos', FEED_LIMIT, 0] as const;

type ListKudosResponse = {
  items: KudosDto[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
};

type ApiError = Error & { status?: number };

const createApiError = (status: number, message: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
};

const parseErrorMessage = async (response: Response) => {
  const fallback = response.statusText || 'Request failed.';
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? fallback;
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

  return (await response.json()) as ListKudosResponse;
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

  return (await response.json()) as KudosDto;
};

export type { ListKudosResponse };
