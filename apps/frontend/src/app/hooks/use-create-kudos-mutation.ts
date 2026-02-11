import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateKudosBodyDto, KudosDto, ListKudosResponseDto } from '@kudos/shared';
import {
  createKudos,
  DEMO_SENDER_ID,
  FEED_LIMIT,
  kudosQueryKey,
} from '../kudos.api';

const addOptimisticKudos = (payload: CreateKudosBodyDto): KudosDto => ({
  id: `optimistic-${Date.now()}`,
  senderId: DEMO_SENDER_ID,
  receiverId: payload.receiverId,
  message: payload.message.trim(),
  category: payload.category,
  createdAt: new Date().toISOString(),
});

export const useCreateKudosMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKudos,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: kudosQueryKey });
      const previous =
        queryClient.getQueryData<ListKudosResponseDto>(kudosQueryKey) ?? null;

      const optimisticItem = addOptimisticKudos(payload);
      queryClient.setQueryData<ListKudosResponseDto>(kudosQueryKey, (current) => {
        const currentItems = current?.items ?? [];
        const optimisticItems = [optimisticItem, ...currentItems].slice(
          0,
          FEED_LIMIT
        );

        return {
          items: optimisticItems,
          pagination: {
            limit: FEED_LIMIT,
            offset: 0,
            count: optimisticItems.length,
          },
        };
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(kudosQueryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: kudosQueryKey });
    },
  });
};
