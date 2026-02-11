import { useQuery } from '@tanstack/react-query';
import { fetchKudos, kudosQueryKey } from '../kudos.api';
import { categoryBadgeMap, formatDate } from '../kudos.ui';

export function KudosList() {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: kudosQueryKey,
    queryFn: fetchKudos,
  });

  return (
    <section
      aria-label="Recent kudos feed"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Recent Kudos</h2>
        {isFetching && !isLoading ? (
          <span className="text-xs text-slate-500">Refreshing...</span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading kudos feed...</p>
      ) : null}

      {isError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Error: {error.message || 'Failed to load kudos.'}
        </p>
      ) : null}

      {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No kudos yet. Be the first to send one.
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <ul className="mt-4 grid list-none gap-3 p-0">
          {(data?.items ?? []).map((item) => {
            const category = categoryBadgeMap[item.category];
            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                    {category.icon} {category.label}
                  </span>
                  <time
                    dateTime={item.createdAt}
                    className="text-xs text-slate-500"
                  >
                    {formatDate(item.createdAt)}
                  </time>
                </div>

                <p className="my-3 whitespace-pre-wrap text-slate-800">{item.message}</p>
                <p className="mt-1 break-all text-sm text-slate-700">
                  <strong>From:</strong> {item.senderId}
                </p>
                <p className="mt-1 break-all text-sm text-slate-700">
                  <strong>To:</strong> {item.receiverId}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
