import {
  CreateKudosBodySchema,
  type CreateKudosBodyDto,
  ListKudosQuerySchema,
  type KudosDto,
  SenderIdHeaderSchema,
} from '@kudos/shared';
import {
  createKudos as createKudosRepository,
  listKudos as listKudosRepository,
} from './db/kudos.repository';

export type CreateKudosInput = {
  senderIdHeader: string | undefined;
  body: unknown;
};

export type ListKudosInput = {
  query: unknown;
};

type ServiceResult = {
  status: number;
  body: unknown;
};

export type KudosServiceDependencies = {
  createKudos: (input: CreateKudosBodyDto & { senderId: string }) => Promise<KudosDto>;
  listKudos: (input: { limit: number; offset: number }) => Promise<KudosDto[]>;
};

const defaultDependencies: KudosServiceDependencies = {
  createKudos: createKudosRepository,
  listKudos: listKudosRepository,
};

export const handleCreateKudos = async (
  input: CreateKudosInput,
  dependencies: KudosServiceDependencies = defaultDependencies
): Promise<ServiceResult> => {
  const senderIdResult = SenderIdHeaderSchema.safeParse({
    senderId: input.senderIdHeader,
  });
  if (!senderIdResult.success) {
    return {
      status: 400,
      body: {
        message: 'Invalid x-user-id header.',
        errors: senderIdResult.error.flatten(),
      },
    };
  }

  const bodyResult = CreateKudosBodySchema.safeParse(input.body);
  if (!bodyResult.success) {
    return {
      status: 400,
      body: {
        message: 'Invalid request body.',
        errors: bodyResult.error.flatten(),
      },
    };
  }

  try {
    const kudos = await dependencies.createKudos({
      ...bodyResult.data,
      senderId: senderIdResult.data.senderId,
    });

    return {
      status: 201,
      body: kudos,
    };
  } catch {
    return {
      status: 500,
      body: { message: 'Failed to create kudos.' },
    };
  }
};

export const handleListKudos = async (
  input: ListKudosInput,
  dependencies: KudosServiceDependencies = defaultDependencies
): Promise<ServiceResult> => {
  const queryResult = ListKudosQuerySchema.safeParse(input.query);
  if (!queryResult.success) {
    return {
      status: 400,
      body: {
        message: 'Invalid query params.',
        errors: queryResult.error.flatten(),
      },
    };
  }

  try {
    const { limit, offset } = queryResult.data;
    const items = await dependencies.listKudos({ limit, offset });

    return {
      status: 200,
      body: {
        items,
        pagination: {
          limit,
          offset,
          count: items.length,
        },
      },
    };
  } catch (e) {
    console.error(e);
    return {
      status: 500,
      body: { message: 'Failed to fetch kudos.' },
    };
  }
};
