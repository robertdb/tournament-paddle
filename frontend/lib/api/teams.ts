import type { PairFormState, PlayersPair } from "@/app/admin/shared/players-pairs";

import { apiRequest } from "./client";

export type PlayersPairPayload = {
  playerA: {
    name: string;
    category: number;
  };
  playerB: {
    name: string;
    category: number;
  };
  contactPhone: string;
};

export type UpdateTeamPayload = Partial<PlayersPairPayload> & {
  checked_in?: boolean;
};

export function buildPlayersPairPayload(
  form: PairFormState,
): PlayersPairPayload {
  return {
    playerA: {
      name: form.playerAName.trim(),
      category: Number(form.playerACategory),
    },
    playerB: {
      name: form.playerBName.trim(),
      category: Number(form.playerBCategory),
    },
    contactPhone: form.contactPhone.trim(),
  };
}

export function buildCheckInPayload(isCheckedIn: boolean): UpdateTeamPayload {
  return {
    checked_in: isCheckedIn,
  };
}

export function getTeams() {
  return apiRequest<PlayersPair[]>("/api/teams");
}

export function createTeam(payload: PlayersPairPayload) {
  return apiRequest<PlayersPair>("/api/teams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTeam(id: string, payload: UpdateTeamPayload) {
  return apiRequest<PlayersPair>(`/api/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
