// SP3-09 — Dashboard with real data
// Server component for auth guard, client component for data fetching

import { redirect } from "next/navigation";

import { DashboardContent } from "./DashboardContent";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardContent />;
}
