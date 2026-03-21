"use client";

import { useMemo, useState } from "react";

import { ApiError } from "@/lib/api/client";
import {
  buildCheckInPayload,
  buildPlayersPairPayload,
} from "@/lib/api/teams";
import { useTeams, useUpdateTeam } from "@/lib/queries/teams";

import {
  CATEGORY_OPTIONS,
  EMPTY_PAIR_FORM,
  formatTimestamp,
  PairFieldErrors,
  PairFormState,
  playersPairMatchesSearch,
  PlayersPair,
  playersPairToFormState,
  validatePairForm,
} from "../shared/players-pairs";

const EMPTY_PAIRS: PlayersPair[] = [];

type Notice = {
  tone: "error" | "success";
  message: string;
};

type PendingAction =
  | {
      type: "edit" | "toggle";
      pairId: string;
    }
  | null;

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function TournamentStartManager() {
  const teamsQuery = useTeams();
  const updateTeam = useUpdateTeam();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PairFormState>(EMPTY_PAIR_FORM);
  const [errors, setErrors] = useState<PairFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const pairs = teamsQuery.data ?? EMPTY_PAIRS;
  const checkedInCount = pairs.filter(
    (pair) => pair.status === "checked_in",
  ).length;
  const pendingCount = pairs.length - checkedInCount;

  const filteredPairs = useMemo(() => {
    return pairs.filter((pair) => playersPairMatchesSearch(pair, search));
  }, [pairs, search]);

  function clearEditor() {
    setEditingId(null);
    setForm(EMPTY_PAIR_FORM);
    setErrors({});
    setFormError("");
  }

  function handleFieldChange(field: keyof PairFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
    setNotice(null);
  }

  function handleEdit(pair: PlayersPair) {
    setEditingId(pair.id);
    setForm(playersPairToFormState(pair));
    setErrors({});
    setFormError("");
    setNotice(null);
  }

  function handleSaveChanges(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { errors: nextErrors, formError: nextFormError } = validatePairForm(
      form,
      pairs,
      editingId,
    );

    if (Object.keys(nextErrors).length > 0 || nextFormError) {
      setErrors(nextErrors);
      setFormError(nextFormError);
      setNotice(null);
      return;
    }

    if (!editingId) {
      return;
    }

    setPendingAction({ type: "edit", pairId: editingId });
    setNotice(null);

    updateTeam.mutate(
      {
        id: editingId,
        payload: buildPlayersPairPayload(form),
      },
      {
        onSuccess: () => {
          clearEditor();
          setNotice({
            tone: "success",
            message: "La pareja se actualizo correctamente en el backend.",
          });
        },
        onError: (error) => {
          setNotice({
            tone: "error",
            message: getErrorMessage(
              error,
              "No se pudieron guardar los cambios de la pareja.",
            ),
          });
        },
        onSettled: () => {
          setPendingAction(null);
        },
      },
    );
  }

  function handleTogglePresence(pair: PlayersPair) {
    const isCheckingIn = pair.status !== "checked_in";

    setPendingAction({ type: "toggle", pairId: pair.id });
    setNotice(null);

    updateTeam.mutate(
      {
        id: pair.id,
        payload: buildCheckInPayload(isCheckingIn),
      },
      {
        onSuccess: () => {
          setNotice({
            tone: "success",
            message: isCheckingIn
              ? `${pair.playerA.name} / ${pair.playerB.name} ya esta presente.`
              : `${pair.playerA.name} / ${pair.playerB.name} volvio a pendiente.`,
          });
        },
        onError: (error) => {
          setNotice({
            tone: "error",
            message: getErrorMessage(
              error,
              "No se pudo actualizar el estado de la pareja.",
            ),
          });
        },
        onSettled: () => {
          setPendingAction(null);
        },
      },
    );
  }

  function handleStartTournament() {
    if (checkedInCount === 0) {
      setNotice({
        tone: "error",
        message:
          "Necesitas al menos una pareja presente para iniciar el torneo.",
      });
      return;
    }

    setNotice({
      tone: "success",
      message: `Inicio mock listo: ${checkedInCount} parejas presentes.`,
    });
  }

  const teamsErrorMessage =
    teamsQuery.error instanceof ApiError
      ? teamsQuery.error.message
      : "No se pudieron cargar las parejas desde el backend.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Dia del torneo
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Check-in del torneo
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Marca presencia, corrige datos si hace falta y deja lista la
                apertura del torneo.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                Total
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {teamsQuery.isPending ? "..." : pairs.length}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Presentes
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-950">
                {teamsQuery.isPending ? "..." : checkedInCount}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-950">
                {teamsQuery.isPending ? "..." : pendingCount}
              </p>
            </div>
          </div>

          {notice ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                notice.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleStartTournament}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Iniciar torneo
          </button>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Edicion
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {editingId ? "Editar pareja" : "Selecciona una pareja"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Los cambios de nombre, categoria y telefono se guardan con el
                mismo recurso de teams.
              </p>
            </div>
          </div>

          {editingId ? (
            <form className="mt-6 space-y-5" onSubmit={handleSaveChanges}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-800">
                    Nombre jugador 1
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500 focus:bg-white"
                    value={form.playerAName}
                    onChange={(event) =>
                      handleFieldChange("playerAName", event.target.value)
                    }
                    placeholder="Ej. Juan Perez"
                  />
                  <FieldMessage message={errors.playerAName} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-800">
                    Categoria jugador 1
                  </span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500 focus:bg-white"
                    value={form.playerACategory}
                    onChange={(event) =>
                      handleFieldChange("playerACategory", event.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <FieldMessage message={errors.playerACategory} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-800">
                    Nombre jugador 2
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500 focus:bg-white"
                    value={form.playerBName}
                    onChange={(event) =>
                      handleFieldChange("playerBName", event.target.value)
                    }
                    placeholder="Ej. Martin Lopez"
                  />
                  <FieldMessage message={errors.playerBName} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-800">
                    Categoria jugador 2
                  </span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500 focus:bg-white"
                    value={form.playerBCategory}
                    onChange={(event) =>
                      handleFieldChange("playerBCategory", event.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <FieldMessage message={errors.playerBCategory} />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">
                  Telefono de contacto
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500 focus:bg-white"
                  value={form.contactPhone}
                  onChange={(event) =>
                    handleFieldChange("contactPhone", event.target.value)
                  }
                  inputMode="tel"
                  placeholder="Ej. 11 5555 4444"
                />
                <FieldMessage message={errors.contactPhone} />
              </label>

              {formError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={updateTeam.isPending}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {pendingAction?.type === "edit" &&
                  pendingAction.pairId === editingId
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={clearEditor}
                  disabled={updateTeam.isPending}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Sin seleccion
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Usa el boton Editar de una pareja para corregir nombres,
                categorias o telefono antes de iniciar el torneo.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Check-in
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Parejas precargadas
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              La data se hidrata desde el backend de teams y permite confirmar
              presencia sobre la precarga real.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {teamsQuery.isPending
                ? "Cargando parejas..."
                : `${pairs.length} ${pairs.length === 1 ? "pareja" : "parejas"}`}
            </div>
            <label className="w-full sm:w-72">
              <span className="sr-only">Buscar pareja</span>
              <input
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o telefono"
              />
            </label>
          </div>
        </div>

        {teamsQuery.isPending ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Cargando
            </p>
            <h4 className="mt-3 text-xl font-semibold text-slate-950">
              Estamos consultando las parejas del backend
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              En cuanto responda `GET /api/teams`, se actualiza el listado para
              operar el check-in.
            </p>
          </div>
        ) : teamsQuery.isError ? (
          <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
              Error de carga
            </p>
            <h4 className="mt-3 text-xl font-semibold text-rose-950">
              No se pudo obtener la precarga del torneo
            </h4>
            <p className="mt-3 text-sm leading-6 text-rose-700">
              {teamsErrorMessage}
            </p>
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              {pairs.length === 0 ? "Estado vacio" : "Sin coincidencias"}
            </p>
            <h4 className="mt-3 text-xl font-semibold text-slate-950">
              {pairs.length === 0
                ? "No hay parejas precargadas para el check-in"
                : "No encontramos parejas para esa busqueda"}
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {pairs.length === 0
                ? "Carga parejas desde precarga para verlas disponibles en esta etapa."
                : "Prueba con otro nombre o telefono para encontrarlas."}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredPairs.map((pair) => {
              const isCheckedIn = pair.status === "checked_in";
              const isTogglingPair =
                pendingAction?.type === "toggle" &&
                pendingAction.pairId === pair.id;

              return (
                <li
                  key={pair.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.8)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isCheckedIn
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {isCheckedIn ? "Presente" : "Pendiente"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isCheckedIn
                            ? `Confirmada ${formatTimestamp(pair.checkedInAt)}`
                            : `Actualizada ${formatTimestamp(pair.updatedAt)}`}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Jugador 1
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">
                            {pair.playerA.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Categoria {pair.playerA.category}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Jugador 2
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">
                            {pair.playerB.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Categoria {pair.playerB.category}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Telefono de la pareja
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {pair.contactPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:w-44">
                      <button
                        type="button"
                        onClick={() => handleTogglePresence(pair)}
                        disabled={updateTeam.isPending}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          isCheckedIn
                            ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        {isTogglingPair
                          ? isCheckedIn
                            ? "Quitando..."
                            : "Confirmando..."
                          : isCheckedIn
                            ? "Quitar presente"
                            : "Dar presente"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(pair)}
                        disabled={updateTeam.isPending}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        Editar
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
  );
}
