import { redirect } from "next/navigation";

// Root page — middleware handles auth-based redirect to /login or /dashboard
// This is a fallback if middleware doesn't catch it
export default function Home() {
  redirect("/dashboard");
}
