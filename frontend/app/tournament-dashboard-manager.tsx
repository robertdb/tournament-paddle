"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import {
  createMockCourts,
  createMockTournamentMatches,
  findMatchById,
  getUpcomingMatches,
} from "./shared/tournament-dashboard";
import type {
  Court,
  CourtId,
  MatchTeam,
  TournamentMatch,
} from "./shared/tournament-dashboard";

function StatusPill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "blue" | "green" | "amber";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-dashboard-sky/20 text-dashboard-sky ring-1 ring-inset ring-dashboard-sky/30"
      : tone === "green"
        ? "bg-dashboard-upper-green/20 text-dashboard-upper-green ring-1 ring-inset ring-dashboard-upper-green/30"
        : "bg-dashboard-amber/20 text-dashboard-amber ring-1 ring-inset ring-dashboard-amber/30";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

function TeamBadge({
  team,
  tone,
}: {
  team: MatchTeam;
  tone: "left" | "right";
}) {
  const [playerA, playerB = ""] = team.displayName.split(" / ");
  const toneClass =
    tone === "left"
      ? "border-dashboard-sky/30 bg-[linear-gradient(180deg,var(--dashboard-blue),var(--dashboard-blue-deep))] shadow-[0_18px_50px_-30px_rgba(56,189,248,0.9)]"
      : "border-dashboard-upper-green/30 bg-[linear-gradient(180deg,var(--dashboard-upper-green),var(--dashboard-lower-green))] shadow-[0_18px_50px_-30px_rgba(17,169,40,0.9)]";

  return (
    <div
      className={`w-32 rounded-[22px] border p-3 text-center text-white backdrop-blur-sm sm:w-40 ${toneClass}`}
    >
      <p className="text-sm font-semibold leading-5">{playerA}</p>
      <p className="mt-1 text-sm font-semibold leading-5">{playerB}</p>
    </div>
  );
}

function CourtCard({
  court,
  match,
  onFinish,
}: {
  court: Court;
  match: TournamentMatch | null;
  onFinish: (courtId: CourtId) => void;
}) {
  const isBusy = match !== null;

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_28%),linear-gradient(180deg,var(--dashboard-ink),var(--dashboard-navy))] p-5 text-dashboard-ice shadow-[0_30px_100px_-55px_rgba(15,23,42,1)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="blue">{court.label}</StatusPill>
          <StatusPill tone={isBusy ? "green" : "amber"}>
            {isBusy ? "En juego" : "Disponible"}
          </StatusPill>
        </div>

        {match ? (
          <button
            type="button"
            onClick={() => onFinish(court.id)}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-dashboard-ice transition hover:border-white/30 hover:bg-white/15"
          >
            Finalizar partido
          </button>
        ) : null}
      </div>

      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-dashboard-night/60">
        <Image
          src="/cancha-de-padel.jpg"
          alt={`Vista superior de ${court.label}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.42))]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(2,6,23,0.44),transparent)]" />

        {match ? (
          <>
            <div className="absolute inset-0 flex items-center justify-between gap-2 px-[7%]">
              <TeamBadge team={match.teamA} tone="left" />
              <div className="rounded-full border border-white/20 bg-dashboard-night/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-dashboard-ice shadow-[0_20px_50px_-35px_rgba(15,23,42,1)]">
                VS
              </div>
              <TeamBadge team={match.teamB} tone="right" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="rounded-[26px] border border-white/10 bg-dashboard-night/70 px-6 py-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dashboard-amber/80">
                Esperando asignacion
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-dashboard-ice">
                {court.label} libre
              </h3>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function TournamentDashboardManager() {
  const [courts, setCourts] = useState<Court[]>(() => createMockCourts());
  const [matches, setMatches] = useState<TournamentMatch[]>(() =>
    createMockTournamentMatches(),
  );

  const upcomingMatches = useMemo(() => getUpcomingMatches(matches), [matches]);

  function handleAssignMatch(courtId: CourtId, matchId: string) {
    const court = courts.find((currentCourt) => currentCourt.id === courtId);
    const match = matches.find((currentMatch) => currentMatch.id === matchId);

    if (!court || !match) {
      return;
    }

    if (court.currentMatchId) {
      return;
    }

    if (match.status !== "upcoming") {
      return;
    }

    setCourts((currentCourts) =>
      currentCourts.map((currentCourt) =>
        currentCourt.id === courtId
          ? {
              ...currentCourt,
              currentMatchId: matchId,
            }
          : currentCourt,
      ),
    );

    setMatches((currentMatches) =>
      currentMatches.map((currentMatch) =>
        currentMatch.id === matchId
          ? {
              ...currentMatch,
              status: "on_court",
              assignedCourtId: courtId,
              finishedAt: null,
            }
          : currentMatch,
      ),
    );
  }

  function handleFinishMatch(courtId: CourtId) {
    const court = courts.find((currentCourt) => currentCourt.id === courtId);
    const match = findMatchById(matches, court?.currentMatchId ?? null);

    if (!court || !match) {
      return;
    }

    const now = new Date().toISOString();

    setCourts((currentCourts) =>
      currentCourts.map((currentCourt) =>
        currentCourt.id === courtId
          ? {
              ...currentCourt,
              currentMatchId: null,
            }
          : currentCourt,
      ),
    );

    setMatches((currentMatches) =>
      currentMatches.map((currentMatch) =>
        currentMatch.id === match.id
          ? {
              ...currentMatch,
              status: "finished",
              assignedCourtId: null,
              finishedAt: now,
            }
          : currentMatch,
      ),
    );
  }

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(17,169,40,0.12),_transparent_22%),linear-gradient(180deg,var(--dashboard-night)_0%,var(--dashboard-ink)_45%,var(--dashboard-navy)_100%)] text-dashboard-ice">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/precarga"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-dashboard-ice transition hover:border-white/20 hover:bg-white/10"
          >
            Abrir precarga
          </Link>
          <Link
            href="/admin/tournament-start"
            className="inline-flex items-center justify-center rounded-full bg-dashboard-sky px-5 py-3 text-sm font-semibold text-dashboard-night transition hover:bg-dashboard-sky/90"
          >
            Abrir check-in
          </Link>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dashboard-slate">
                Estado en vivo
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-dashboard-ice">
                Las dos canchas del torneo
              </h2>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                match={findMatchById(matches, court.currentMatchId)}
                onFinish={handleFinishMatch}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,169,40,0.16),transparent_28%),linear-gradient(180deg,var(--dashboard-ink),var(--dashboard-navy))] p-6 shadow-[0_30px_100px_-60px_rgba(2,6,23,1)] sm:p-8">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-dashboard-ice">
                Proximos partidos
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-dashboard-ice">
              {upcomingMatches.length === 0
                ? "Sin partidos pendientes"
                : `${upcomingMatches.length} ${upcomingMatches.length === 1 ? "partido pendiente" : "partidos pendientes"}`}
            </div>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dashboard-slate">
                Cola vacia
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-dashboard-ice">
                No quedan proximos partidos por asignar
              </h3>
              <p className="mt-3 text-sm leading-7 text-dashboard-slate">
                Si las canchas tambien estan libres, el tablero ya termino la
                jornada mock actual.
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {upcomingMatches.map((match) => {
                const isCourt1Busy = courts.some(
                  (court) =>
                    court.id === "court-1" && court.currentMatchId !== null,
                );
                const isCourt2Busy = courts.some(
                  (court) =>
                    court.id === "court-2" && court.currentMatchId !== null,
                );

                return (
                  <li
                    key={match.id}
                    className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_18px_40px_-35px_rgba(15,23,42,1)] sm:px-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-dashboard-ice sm:text-lg">
                            {match.teamA.displayName}
                          </p>
                        </div>

                        <div className="hidden rounded-full border border-white/10 bg-dashboard-night/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-dashboard-slate sm:inline-flex">
                          VS
                        </div>

                        <p className="text-base font-semibold text-dashboard-ice sm:text-lg">
                          {match.teamB.displayName}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleAssignMatch("court-1", match.id)}
                          disabled={isCourt1Busy}
                          className="inline-flex items-center justify-center rounded-full border border-dashboard-sky/20 bg-dashboard-sky/10 px-4 py-3 text-sm font-semibold text-dashboard-ice transition hover:border-dashboard-sky/30 hover:bg-dashboard-sky/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-dashboard-slate"
                        >
                          {isCourt1Busy
                            ? "Cancha 1 ocupada"
                            : "Mandar a Cancha 1"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignMatch("court-2", match.id)}
                          disabled={isCourt2Busy}
                          className="inline-flex items-center justify-center rounded-full border border-dashboard-upper-green/20 bg-dashboard-upper-green/10 px-4 py-3 text-sm font-semibold text-dashboard-ice transition hover:border-dashboard-upper-green/30 hover:bg-dashboard-upper-green/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-dashboard-slate"
                        >
                          {isCourt2Busy
                            ? "Cancha 2 ocupada"
                            : "Mandar a Cancha 2"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
