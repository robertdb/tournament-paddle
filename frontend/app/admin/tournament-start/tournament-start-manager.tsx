"use client";

import { useMemo, useState } from "react";

import {
  CATEGORY_OPTIONS,
  createMockPreloadedPairs,
  EMPTY_PAIR_FORM,
  formatMatchFormat,
  formatTimestamp,
  MatchFormat,
  PairFieldErrors,
  PairFormState,
  playersPairMatchesSearch,
  PlayersPair,
  playersPairToFormState,
  TournamentSettingsState,
  updatePlayersPair,
  validatePairForm,
} from "../shared/players-pairs";

type Notice = {
  tone: "error" | "success";
  message: string;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

export function TournamentStartManager() {
  const [pairs, setPairs] = useState<PlayersPair[]>(() =>
    createMockPreloadedPairs(),
  );
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PairFormState>(EMPTY_PAIR_FORM);
  const [errors, setErrors] = useState<PairFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [settings, setSettings] = useState<TournamentSettingsState>({
    matchFormat: null,
  });

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

    setPairs((current) =>
      current.map((pair) =>
        pair.id === editingId ? updatePlayersPair(pair, form) : pair,
      ),
    );
    clearEditor();
    setNotice({
      tone: "success",
      message: "La pareja se actualizo correctamente en el estado mock.",
    });
  }

  function handleTogglePresence(pair: PlayersPair) {
    const nextStatus =
      pair.status === "checked_in" ? "preloaded" : "checked_in";
    const nextCheckedInAt =
      nextStatus === "checked_in" ? new Date().toISOString() : null;

    setPairs((current) =>
      current.map((currentPair) =>
        currentPair.id === pair.id
          ? {
              ...currentPair,
              status: nextStatus,
              checkedInAt: nextCheckedInAt,
              updatedAt: new Date().toISOString(),
            }
          : currentPair,
      ),
    );

    setNotice({
      tone: "success",
      message:
        nextStatus === "checked_in"
          ? `${pair.playerA.name} / ${pair.playerB.name} ya esta presente.`
          : `${pair.playerA.name} / ${pair.playerB.name} volvio a pendiente.`,
    });
  }

  function handleMatchFormatChange(matchFormat: MatchFormat) {
    setSettings({ matchFormat });
    setNotice(null);
  }

  function handleStartTournament() {
    if (!settings.matchFormat) {
      setNotice({
        tone: "error",
        message: "Selecciona primero el formato de partidos antes de iniciar.",
      });
      return;
    }

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
      message: `Inicio mock listo: ${checkedInCount} parejas presentes con formato ${formatMatchFormat(settings.matchFormat)}.`,
    });
  }

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
                Check-in y configuracion
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Marca presencia, revisa la configuracion base del torneo y deja
                listo el siguiente paso operativo.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                Total
              </p>
              <p className="mt-2 text-3xl font-semibold">{pairs.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Presentes
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-950">
                {checkedInCount}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-950">
                {pendingCount}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Settings
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Partidos
                </h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {formatMatchFormat(settings.matchFormat)}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {[
                { value: "4_games" as const, label: "A 4 games" },
                { value: "6_games" as const, label: "A 6 games" },
              ].map((option) => {
                const isActive = settings.matchFormat === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMatchFormatChange(option.value)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {option.label}
                    </span>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        isActive ? "bg-amber-300" : "bg-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
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
                El check-in tambien permite corregir datos basicos antes del
                inicio del torneo.
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
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={clearEditor}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
              La data inicial simula la salida de precarga. Desde aqui puedes
              confirmar presencia y ajustar datos antes del arranque.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {pairs.length} {pairs.length === 1 ? "pareja" : "parejas"}
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

        {filteredPairs.length === 0 ? (
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
                ? "Cuando exista integracion, aqui se hidrataran desde la precarga."
                : "Prueba con otro nombre o telefono para encontrarlas."}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredPairs.map((pair) => {
              const isCheckedIn = pair.status === "checked_in";

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
                        className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                          isCheckedIn
                            ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        {isCheckedIn ? "Quitar presente" : "Dar presente"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(pair)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
