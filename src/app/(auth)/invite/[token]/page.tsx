import Link from "next/link";
import crypto from "crypto";

import { acceptInviteCreateAccountAction } from "@/app/(dashboard)/dashboard.actions";
import { prisma } from "@/lib/prisma";

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: { error?: string } | Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await Promise.resolve(searchParams ?? {});

  const tokenHash = sha256Hex(token);
  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    include: { couple: true },
  });

  const invalidReason =
    !invite
      ? "Convite invalido."
      : invite.acceptedAt
        ? "Convite ja foi usado."
        : invite.expiresAt.getTime() < Date.now()
          ? "Convite expirou."
          : null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Convite
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Entrar no cantinho: <span className="font-medium">{invite?.couple.name ?? "-"}</span>
        </p>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {invalidReason ? (
          <div className="mt-6 space-y-4 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-300">
            <div>{invalidReason}</div>
            <Link
              href="/login"
              className="inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
            >
              Ir para login
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-300">
              Email convidado: <span className="font-medium">{invite!.email}</span>
            </div>

            <form action={acceptInviteCreateAccountAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Seu nome (opcional)
                </label>
                <input
                  name="name"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Senha
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Confirmar senha
                </label>
                <input
                  name="password2"
                  type="password"
                  required
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
              >
                Criar conta e entrar
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
