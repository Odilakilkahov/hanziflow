import { useNavigation } from '@/hooks'

/** Заглушка. Codex заменяет её полноценной оболочкой с навигацией и экранами. */
export function Root() {
  const { view, items, setView } = useNavigation()
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold tracking-tight">HanziFlow</h1>
      <nav className="mt-4 flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.view}
            type="button"
            onClick={() => setView(it.view)}
            className={it.view === view ? 'rounded bg-white px-3 py-1 text-black' : 'rounded border border-white/20 px-3 py-1'}
          >
            {it.title}
          </button>
        ))}
      </nav>
      <p className="mt-6 text-white/60">Экран: {view}</p>
    </main>
  )
}
