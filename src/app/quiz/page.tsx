// SP2-11 — Quiz page (full flow)
// Uses mock data until SYNC-5 (Dev 2 delivers quiz + answer APIs)
// Then swap mockFetchQuestions/mockSubmitAnswer for real fetch() calls

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuizFlow } from "./QuizFlow";

export default async function QuizPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <QuizFlow />;
}
