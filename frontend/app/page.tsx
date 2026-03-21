import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),_transparent_25%),linear-gradient(180deg,_#fefce8_0%,_#ffffff_42%,_#e2e8f0_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[40px] border border-white/70 bg-[linear-gradient(135deg,rgba(120,53,15,0.98),rgba(30,41,59,0.96))] px-6 py-10 text-white shadow-[0_35px_100px_-50px_rgba(15,23,42,0.95)] sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Tournament Paddle
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Gestión operativa para torneos de pádel de un único día.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              El frontend ya tiene lista la primera pieza del flujo operativo:
              la precarga de parejas previa al check-in y a la inicialización
              del torneo.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.6)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Paso actual
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Carga inicial de jugadores por pareja
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Cada pareja registra dos jugadores, una categoría por jugador y
              un único teléfono de contacto. El objetivo es llegar al día del
              torneo con los participantes ya cargados y listos para confirmar
              asistencia.
            </p>
          </article>

          <aside className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 shadow-[0_24px_60px_-45px_rgba(120,53,15,0.5)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Acceso rápido
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950">
              Abrir precarga
            </h2>
            <p className="mt-4 text-sm leading-7 text-amber-900/80">
              Entrá a la vista de administración para empezar a registrar
              parejas en estado mockeado.
            </p>
            <Link
              href="/admin/precarga"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ir a /admin/precarga
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
