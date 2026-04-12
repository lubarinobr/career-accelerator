// SP1-09 — Dashboard page (shell)
// Displays user name + avatar from session, placeholder stat cards

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { BottomNav } from "@/components/BottomNav";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { name, image } = session.user;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="px-4 pt-8">
        <div className="flex items-center gap-4">
          {image && (
            <Image
              src={image}
              alt={name ?? "User avatar"}
              width={56}
              height={56}
              className="rounded-full ring-2 ring-blue-200"
            />
          )}
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-2xl font-bold text-orange-500">0</p>
            <p className="mt-1 text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="mt-1 text-xs text-gray-500">Total XP</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="mt-1 text-xs text-gray-500">Intern</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
