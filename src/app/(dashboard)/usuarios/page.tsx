import Link from "next/link";

import { createInviteAction } from "@/app/(dashboard)/dashboard.actions";
import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams?:
    | { error?: string; invite?: string; to?: string }
    | Promise<{ error?: string; invite?: string; to?: string }>;
}) {
  const { couple } = await requireCouple();
  const { error, invite, to } = await Promise.resolve(searchParams ?? {});

  const members = await prisma.membership.findMany({
    where: { coupleId: couple.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, email: true, name: true, createdAt: true } } },
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  const inviteLink = invite && typeof invite === "string" ? (appUrl ? `${appUrl}/invite/${invite}` : null) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Convide o parceiro por email e ele entra pelo link.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {invite ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="font-medium">Convite criado{to ? ` para ${to}` : ""}.</div>
          <div className="mt-2 break-all">
            Link:{" "}
            <Link className="underline" href={`/invite/${invite}`}>
              {inviteLink ?? `/invite/${invite}`}
            </Link>
          </div>
          <div className="mt-2 text-xs opacity-80">
            Dica: configure `NEXT_PUBLIC_APP_URL` no `.env` pra mostrar o link completo.
          </div>
        </div>
      ) : null}

      <form
        action={createInviteAction}
        className="space-y-4 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Email do parceiro
          </label>
          <input
            name="email"
            type="email"
            required
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          Gerar convite
        </button>
      </form>

      <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Membros
        </div>
        <div className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-900">
          {members.map((m) => (
            <div key={m.user.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                  {m.user.name || m.user.email}
                </div>
                <div className="truncate text-xs text-zinc-500">{m.user.email}</div>
              </div>
              <div className="shrink-0 text-xs text-zinc-500">
                {m.user.createdAt.toISOString().slice(0, 10)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
