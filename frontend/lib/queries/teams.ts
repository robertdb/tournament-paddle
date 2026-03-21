"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTeam,
  getTeams,
  updateTeam,
  type PlayersPairPayload,
  type UpdateTeamPayload,
} from "../api/teams";

export const teamsQueryKey = ["teams"] as const;

export function useTeams() {
  return useQuery({
    queryKey: teamsQueryKey,
    queryFn: getTeams,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlayersPairPayload) => createTeam(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTeamPayload;
    }) => updateTeam(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
}
