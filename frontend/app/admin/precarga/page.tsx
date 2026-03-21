import type { Metadata } from "next";
import Link from "next/link";

import { PreloadPairsManager } from "./preload-pairs-manager";

export const metadata: Metadata = {
  title: "Precarga de parejas",
  description: "Carga inicial de parejas antes del check-in del torneo.",
};

export default function PreloadPairsPage() {
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_46%,_#eef2ff_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(51,65,85,0.94))] px-6 py-8 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.85)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                Tournament Paddle
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Ruta de precarga para armar la base del torneo.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Esta pantalla concentra la carga inicial de parejas antes de la
                reconfirmación. Todavía no hace check-in ni genera grupos, pero
                deja a los participantes listos para ese flujo.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <PreloadPairsManager />
      </div>
    </main>
  );
}
