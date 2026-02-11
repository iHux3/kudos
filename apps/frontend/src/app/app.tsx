import { KudosForm } from './components/kudos-form';
import { KudosList } from './components/kudos-list';

export function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Kudos Wall
          </h1>
          <p className="mt-3 text-slate-600">
            Posli dik kolegovi a sleduj posledni kudos v realnem feedu.
          </p>
        </header>

        <section
          className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]"
          aria-label="Kudos workspace"
        >
          <KudosForm />
          <KudosList />
        </section>
      </div>
    </main>
  );
}

export default App;
