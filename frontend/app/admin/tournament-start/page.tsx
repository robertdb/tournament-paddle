import type { Metadata } from "next";
import Link from "next/link";

import { TournamentStartManager } from "./tournament-start-manager";

export const metadata: Metadata = {
  title: "Tournament Start",
  description:
    "Confirmacion de llegada y settings previos al inicio del torneo.",
};

export default function TournamentStartPage() {
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_46%,_#eef2ff_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/precarga"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Volver a precarga
          </Link>

          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Tournament start
          </div>
        </div>

        <TournamentStartManager />
      </div>
    </main>
  );
}
