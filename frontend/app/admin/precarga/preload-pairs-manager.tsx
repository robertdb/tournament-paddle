"use client";

import { useMemo, useState } from "react";

import {
  CATEGORY_OPTIONS,
  EMPTY_PAIR_FORM,
  formatTimestamp,
  PairFieldErrors,
  PairFormState,
  PlayersPair,
  playersPairMatchesSearch,
  validatePairForm,
} from "../shared/players-pairs";
import { ApiError } from "@/lib/api/client";
import { buildPlayersPairPayload } from "@/lib/api/teams";
import { useCreateTeam, useTeams } from "@/lib/queries/teams";

const EMPTY_PAIRS: PlayersPair[] = [];

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

export function PreloadPairsManager() {
  const teamsQuery = useTeams();
  const createTeam = useCreateTeam();

  const [form, setForm] = useState<PairFormState>(EMPTY_PAIR_FORM);
  const [errors, setErrors] = useState<PairFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState("");

  const pairs = teamsQuery.data ?? EMPTY_PAIRS;

  const filteredPairs = useMemo(() => {
    return pairs.filter((pair) => playersPairMatchesSearch(pair, search));
  }, [pairs, search]);

  function resetForm() {
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { errors: nextErrors, formError: nextFormError } = validatePairForm(
      form,
      pairs,
      null,
    );

    if (Object.keys(nextErrors).length > 0 || nextFormError) {
      setErrors(nextErrors);
      setFormError(nextFormError);
      setNotice(null);
      return;
    }

    createTeam.mutate(buildPlayersPairPayload(form), {
      onSuccess: () => {
        resetForm();
        setNotice({
          tone: "success",
          message: "La pareja quedó precargada correctamente en el backend.",
        });
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "No se pudo crear la pareja. Intenta nuevamente.";

        setNotice({
          tone: "error",
          message,
        });
      },
    });
  }

  const teamsErrorMessage =
    teamsQuery.error instanceof ApiError
      ? teamsQuery.error.message
      : "No se pudieron cargar las parejas desde el backend.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)] lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Precarga de parejas
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Registrá participantes antes del check-in. Esta pantalla ya está
              integrada con el backend de equipos.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
                placeholder="Ej. Juan Pérez"
              />
              <FieldMessage message={errors.playerAName} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">
                Categoría jugador 1
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
                placeholder="Ej. Martín López"
              />
              <FieldMessage message={errors.playerBName} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">
                Categoría jugador 2
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
              Teléfono de contacto
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

          {notice ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                notice.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={createTeam.isPending}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {createTeam.isPending ? "Guardando..." : "Agregar pareja"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Estado actual
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Parejas cargadas
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Estas parejas salen de `GET /api/teams` y quedan listas para el
              futuro check-in.
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
                placeholder="Buscar por nombre o teléfono"
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
              Cargando parejas desde el backend
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Espera un momento mientras consultamos `/api/teams`.
            </p>
          </div>
        ) : teamsQuery.isError ? (
          <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
              Error de carga
            </p>
            <h4 className="mt-3 text-xl font-semibold text-rose-950">
              No se pudieron obtener las parejas
            </h4>
            <p className="mt-3 text-sm leading-6 text-rose-700">
              {teamsErrorMessage}
            </p>
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              {pairs.length === 0 ? "Estado vacío" : "Sin coincidencias"}
            </p>
            <h4 className="mt-3 text-xl font-semibold text-slate-950">
              {pairs.length === 0
                ? "Todavía no hay parejas cargadas"
                : "No encontramos parejas para esa búsqueda"}
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {pairs.length === 0
                ? "Usa el formulario para registrar la primera dupla en el backend."
                : "Prueba con otro nombre o teléfono para encontrar la pareja."}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredPairs.map((pair) => (
              <li
                key={pair.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.8)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Precargada
                      </span>
                      <span className="text-xs text-slate-500">
                        Actualizada {formatTimestamp(pair.updatedAt)}
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
                          Categoría {pair.playerA.category}
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
                          Categoría {pair.playerB.category}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                        Teléfono de la pareja
                      </p>
                      <p className="mt-2 text-sm font-medium text-amber-950">
                        {pair.contactPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
