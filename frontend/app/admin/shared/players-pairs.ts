export type PlayerCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type PlayersPairStatus = "preloaded" | "checked_in";
export type MatchFormat = "4_games" | "6_games";

export type Player = {
  name: string;
  category: PlayerCategory;
};

export type PlayersPair = {
  id: string;
  contactPhone: string;
  playerA: Player;
  playerB: Player;
  status: PlayersPairStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TournamentSettingsState = {
  matchFormat: MatchFormat | null;
};

export type PairFormState = {
  playerAName: string;
  playerACategory: string;
  playerBName: string;
  playerBCategory: string;
  contactPhone: string;
};

export type PairFieldErrors = Partial<Record<keyof PairFormState, string>>;

const MOCK_PRELOADED_PAIRS: PlayersPair[] = [
  {
    id: "pair-1",
    contactPhone: "11 5555 1001",
    playerA: { name: "Juan Perez", category: 4 },
    playerB: { name: "Martin Lopez", category: 5 },
    status: "preloaded",
    checkedInAt: null,
    createdAt: "2025-03-21T14:00:00.000Z",
    updatedAt: "2025-03-21T14:00:00.000Z",
  },
  {
    id: "pair-2",
    contactPhone: "11 5555 1002",
    playerA: { name: "Santiago Diaz", category: 6 },
    playerB: { name: "Lucas Romero", category: 6 },
    status: "preloaded",
    checkedInAt: null,
    createdAt: "2025-03-21T14:10:00.000Z",
    updatedAt: "2025-03-21T14:10:00.000Z",
  },
  {
    id: "pair-3",
    contactPhone: "11 5555 1003",
    playerA: { name: "Tomas Alvarez", category: 3 },
    playerB: { name: "Nicolas Suarez", category: 4 },
    status: "preloaded",
    checkedInAt: null,
    createdAt: "2025-03-21T14:20:00.000Z",
    updatedAt: "2025-03-21T14:20:00.000Z",
  },
  {
    id: "pair-4",
    contactPhone: "11 5555 1004",
    playerA: { name: "Facundo Garcia", category: 7 },
    playerB: { name: "Emiliano Torres", category: 7 },
    status: "preloaded",
    checkedInAt: null,
    createdAt: "2025-03-21T14:30:00.000Z",
    updatedAt: "2025-03-21T14:30:00.000Z",
  },
];

export const CATEGORY_OPTIONS: PlayerCategory[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const EMPTY_PAIR_FORM: PairFormState = {
  playerAName: "",
  playerACategory: "",
  playerBName: "",
  playerBCategory: "",
  contactPhone: "",
};

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function formatName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildPairSignature(playerAName: string, playerBName: string) {
  return [normalizeName(playerAName), normalizeName(playerBName)].sort().join("|");
}

export function validatePairForm(
  form: PairFormState,
  pairs: PlayersPair[],
  editingId: string | null,
) {
  const errors: PairFieldErrors = {};
  let formError = "";

  const playerAName = formatName(form.playerAName);
  const playerBName = formatName(form.playerBName);
  const normalizedPlayerA = normalizeName(playerAName);
  const normalizedPlayerB = normalizeName(playerBName);
  const normalizedPhone = normalizePhone(form.contactPhone);
  const playerACategory = Number(form.playerACategory);
  const playerBCategory = Number(form.playerBCategory);

  if (!playerAName) {
    errors.playerAName = "Ingresa el nombre del jugador 1.";
  }

  if (!playerBName) {
    errors.playerBName = "Ingresa el nombre del jugador 2.";
  }

  if (
    playerAName &&
    playerBName &&
    normalizedPlayerA &&
    normalizedPlayerA === normalizedPlayerB
  ) {
    errors.playerAName = "Los jugadores deben ser distintos.";
    errors.playerBName = "Los jugadores deben ser distintos.";
  }

  if (!Number.isInteger(playerACategory) || playerACategory < 1 || playerACategory > 9) {
    errors.playerACategory = "Elegi una categoria entre 1 y 9.";
  }

  if (!Number.isInteger(playerBCategory) || playerBCategory < 1 || playerBCategory > 9) {
    errors.playerBCategory = "Elegi una categoria entre 1 y 9.";
  }

  if (!form.contactPhone.trim()) {
    errors.contactPhone = "Ingresa un telefono de contacto.";
  } else if (!normalizedPhone) {
    errors.contactPhone = "Ingresa un telefono valido.";
  }

  if (
    normalizedPhone &&
    pairs.some(
      (pair) => pair.id !== editingId && normalizePhone(pair.contactPhone) === normalizedPhone,
    )
  ) {
    errors.contactPhone = "Ya existe una pareja cargada con ese telefono.";
  }

  if (
    normalizedPlayerA &&
    normalizedPlayerB &&
    pairs.some(
      (pair) =>
        pair.id !== editingId &&
        buildPairSignature(pair.playerA.name, pair.playerB.name) ===
        buildPairSignature(playerAName, playerBName),
    )
  ) {
    formError = "Ya existe una pareja cargada con esos dos jugadores.";
  }

  return { errors, formError };
}

export function buildPlayersPair(
  form: PairFormState,
  overrides: Partial<PlayersPair> = {},
): PlayersPair {
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? crypto.randomUUID(),
    contactPhone: form.contactPhone.trim(),
    playerA: {
      name: formatName(form.playerAName),
      category: Number(form.playerACategory) as PlayerCategory,
    },
    playerB: {
      name: formatName(form.playerBName),
      category: Number(form.playerBCategory) as PlayerCategory,
    },
    status: overrides.status ?? "preloaded",
    checkedInAt: overrides.checkedInAt ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

export function updatePlayersPair(pair: PlayersPair, form: PairFormState) {
  return {
    ...pair,
    contactPhone: form.contactPhone.trim(),
    playerA: {
      name: formatName(form.playerAName),
      category: Number(form.playerACategory) as PlayerCategory,
    },
    playerB: {
      name: formatName(form.playerBName),
      category: Number(form.playerBCategory) as PlayerCategory,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function playersPairToFormState(pair: PlayersPair): PairFormState {
  return {
    playerAName: pair.playerA.name,
    playerACategory: String(pair.playerA.category),
    playerBName: pair.playerB.name,
    playerBCategory: String(pair.playerB.category),
    contactPhone: pair.contactPhone,
  };
}

export function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function formatMatchFormat(format: MatchFormat | null) {
  if (format === "4_games") {
    return "A 4 games";
  }

  if (format === "6_games") {
    return "A 6 games";
  }

  return "Sin definir";
}

export function playersPairMatchesSearch(pair: PlayersPair, search: string) {
  const normalizedSearch = normalizeName(search);
  const normalizedSearchPhone = normalizePhone(search);

  if (!normalizedSearch && !normalizedSearchPhone) {
    return true;
  }

  const combinedNames = [pair.playerA.name, pair.playerB.name, pair.contactPhone]
    .join(" ")
    .toLowerCase();

  return (
    combinedNames.includes(normalizedSearch) ||
    normalizePhone(pair.contactPhone).includes(normalizedSearchPhone)
  );
}

export function createMockPreloadedPairs() {
  return MOCK_PRELOADED_PAIRS.map((pair) => ({
    ...pair,
    playerA: { ...pair.playerA },
    playerB: { ...pair.playerB },
  }));
}
