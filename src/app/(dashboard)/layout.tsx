import Link from "next/link";

import { logoutAction } from "@/app/(auth)/auth.actions";
import { NavLinks } from "@/app/(dashboard)/_components/NavLinks";
import { requireCouple } from "@/lib/couple";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, couple } = await requireCouple();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {couple.name}
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Nosso cantinho
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
              {user.name || user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden">
          <NavLinks />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
