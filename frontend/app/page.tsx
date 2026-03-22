import type { Metadata } from "next";

import { TournamentDashboardManager } from "./tournament-dashboard-manager";

export const metadata: Metadata = {
  title: "Tournament Dashboard",
  description: "Dashboard operativo con canchas activas y proximos partidos.",
};

export default function Home() {
  return <TournamentDashboardManager />;
}

