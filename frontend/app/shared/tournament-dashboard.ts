export type CourtId = "court-1" | "court-2";

export type MatchTeam = {
  id: string;
  displayName: string;
};

export type TournamentMatchStatus = "upcoming" | "on_court" | "finished";

export type TournamentMatch = {
  id: string;
  order: number;
  teamA: MatchTeam;
  teamB: MatchTeam;
  status: TournamentMatchStatus;
  assignedCourtId: CourtId | null;
  finishedAt: string | null;
};

export type Court = {
  id: CourtId;
  label: string;
  currentMatchId: string | null;
};

const MOCK_COURTS: Court[] = [
  {
    id: "court-1",
    label: "Cancha 1",
    currentMatchId: null,
  },
  {
    id: "court-2",
    label: "Cancha 2",
    currentMatchId: null,
  },
];

const MOCK_MATCHES: TournamentMatch[] = [
  {
    id: "match-1",
    order: 1,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-1",
      displayName: "Ana Garcia / Laura Perez",
    },
    teamB: {
      id: "team-2",
      displayName: "Sofia Ruiz / Marta Lopez",
    },
  },
  {
    id: "match-2",
    order: 2,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-3",
      displayName: "Diego Torres / Javier Morales",
    },
    teamB: {
      id: "team-4",
      displayName: "Luis Fernandez / Pedro Castro",
    },
  },
  {
    id: "match-3",
    order: 3,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-5",
      displayName: "Roberto Diaz / Alberto Vega",
    },
    teamB: {
      id: "team-6",
      displayName: "Tomas Herrera / Raul Medina",
    },
  },
  {
    id: "match-4",
    order: 4,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-7",
      displayName: "Nicolas Suarez / Facundo Garcia",
    },
    teamB: {
      id: "team-8",
      displayName: "Julian Sosa / Martin Lopez",
    },
  },
  {
    id: "match-5",
    order: 5,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-9",
      displayName: "Pablo Lima / Fernando Ruiz",
    },
    teamB: {
      id: "team-10",
      displayName: "Juan Perez / Emiliano Torres",
    },
  },
  {
    id: "match-6",
    order: 6,
    status: "upcoming",
    assignedCourtId: null,
    finishedAt: null,
    teamA: {
      id: "team-11",
      displayName: "Carlos Mendez / Miguel Arias",
    },
    teamB: {
      id: "team-12",
      displayName: "Santiago Diaz / Lucas Romero",
    },
  },
];

export function createMockCourts() {
  return MOCK_COURTS.map((court) => ({ ...court }));
}

export function createMockTournamentMatches() {
  return MOCK_MATCHES.map((match) => ({
    ...match,
    teamA: { ...match.teamA },
    teamB: { ...match.teamB },
  }));
}

export function findMatchById(
  matches: TournamentMatch[],
  matchId: string | null,
) {
  if (!matchId) {
    return null;
  }

  return matches.find((match) => match.id === matchId) ?? null;
}

export function getUpcomingMatches(matches: TournamentMatch[]) {
  return [...matches]
    .filter((match) => match.status === "upcoming")
    .sort((left, right) => left.order - right.order);
}

export function getOnCourtMatches(matches: TournamentMatch[]) {
  return matches.filter((match) => match.status === "on_court");
}

export function getFinishedMatches(matches: TournamentMatch[]) {
  return matches.filter((match) => match.status === "finished");
}
