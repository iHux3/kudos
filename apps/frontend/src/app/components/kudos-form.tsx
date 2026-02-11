import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateKudosBodySchema,
  KUDOS_CATEGORIES,
  type CreateKudosBodyDto,
} from '@kudos/shared';
import { useCreateKudosMutation } from '../hooks/use-create-kudos-mutation';

export function KudosForm() {
  const createMutation = useCreateKudosMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateKudosBodyDto>({
    resolver: zodResolver(CreateKudosBodySchema),
    defaultValues: {
      receiverId: '',
      category: KUDOS_CATEGORIES[0],
      message: '',
    },
  });

  const onSubmit = async (payload: CreateKudosBodyDto) => {
    await createMutation.mutateAsync(payload);
    reset({
      receiverId: '',
      category: KUDOS_CATEGORIES[0],
      message: '',
    });
  };

  return (
    <section
      aria-label="Send kudos"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">Send Kudos</h2>
      <p className="mt-2 text-sm text-slate-500">
        Sender je fixni demo UUID v hlavicce API.
      </p>

      <form
        className="mt-4 grid gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="grid gap-1 text-sm font-semibold text-slate-800">
          Receiver
          <input
            aria-invalid={Boolean(errors.receiverId)}
            placeholder="receiver UUID"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            {...register('receiverId')}
          />
          {errors.receiverId && (
            <span className="text-sm text-red-700">{errors.receiverId.message}</span>
          )}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-800">
          Category
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            {...register('category')}
          >
            {KUDOS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-sm text-red-700">{errors.category.message}</span>
          )}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-800">
          Message
          <textarea
            aria-invalid={Boolean(errors.message)}
            rows={5}
            placeholder="Napis, za co dekujes..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            {...register('message')}
          />
          {errors.message && (
            <span className="text-sm text-red-700">{errors.message.message}</span>
          )}
        </label>

        {createMutation.error?.message && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Error: {createMutation.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createMutation.isPending ? 'Sending...' : 'Send kudos'}
        </button>
      </form>
    </section>
  );
}
