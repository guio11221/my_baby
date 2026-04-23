import Link from "next/link";

import { PhotoCarousel } from "@/app/(dashboard)/_components/PhotoCarousel";
import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

function fmtDay(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function fmtRel(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 14) return `${days} dias`;
  return fmtDay(d);
}

function Icon({
  name,
  className,
}: {
  name: "photos" | "notes" | "members" | "invites";
  className?: string;
}) {
  const cls = className ?? "h-4 w-4";
  if (name === "photos") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
        <path
          d="M7 7.5h2.2l1.2-1.8c.2-.3.5-.5.9-.5h1.4c.4 0 .7.2.9.5l1.2 1.8H17c1.7 0 3 1.3 3 3V17c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3v-6.5c0-1.7 1.3-3 3-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  if (name === "notes") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
        <path
          d="M8 7h8M8 11h8M8 15h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9.2a2 2 0 0 1-1.4-.6L4.6 17.2A2 2 0 0 1 4 15.8V7a3 3 0 0 1 3-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "members") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
        <path
          d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 13a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 13Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
      <path
        d="M7 12h10M12 7v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  accentClass,
  sub,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  accentClass: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-md dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </div>
          {sub ? (
            <div className="mt-1 truncate text-xs text-zinc-500">{sub}</div>
          ) : null}
        </div>
        <div
          className={[
            "grid h-10 w-10 shrink-0 place-items-center rounded-md ring-1 ring-inset",
            accentClass,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const { user, couple } = await requireCouple();

  const [photosCount, notesCount, membersCount, pendingInvitesCount, recentPhotos, recentNotes] =
    await Promise.all([
      prisma.photo.count({ where: { coupleId: couple.id } }),
      prisma.note.count({ where: { coupleId: couple.id } }),
      prisma.membership.count({ where: { coupleId: couple.id } }),
      prisma.invite.count({
        where: {
          coupleId: couple.id,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.photo.findMany({
        where: { coupleId: couple.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, src: true, caption: true, createdAt: true },
      }),
      prisma.note.findMany({
        where: { coupleId: couple.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { author: true },
      }),
    ]);

  const cover = recentPhotos[0]?.src ?? null;
  const recentPhotosClient = recentPhotos.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        {cover ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(22px)",
              transform: "scale(1.1)",
              opacity: 0.22,
            }}
          />
        ) : null}
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {couple.name}
              </div>
              <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Oi, {user.name || user.email}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {membersCount} membros • {pendingInvitesCount} convites pendentes
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/photos/new"
                className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
              >
                Nova foto
              </Link>
              <Link
                href="/recados"
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Escrever recado
              </Link>
              <Link
                href="/usuarios"
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Convidar parceiro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Fotos"
          value={String(photosCount)}
          href="/photos"
          sub="Galeria do casal"
          icon={<Icon name="photos" className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
          accentClass="bg-blue-50 ring-blue-100 text-blue-700 dark:bg-blue-950/30 dark:ring-blue-900/50"
        />
        <StatCard
          label="Recados"
          value={String(notesCount)}
          href="/recados"
          sub="Mural de mensagens"
          icon={<Icon name="notes" className="h-5 w-5 text-amber-700 dark:text-amber-300" />}
          accentClass="bg-amber-50 ring-amber-100 text-amber-700 dark:bg-amber-950/30 dark:ring-amber-900/50"
        />
        <StatCard
          label="Membros"
          value={String(membersCount)}
          href="/usuarios"
          sub="Acesso ao cantinho"
          icon={<Icon name="members" className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />}
          accentClass="bg-emerald-50 ring-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:ring-emerald-900/50"
        />
        <StatCard
          label="Convites"
          value={String(pendingInvitesCount)}
          href="/usuarios"
          sub="Pendentes"
          icon={<Icon name="invites" className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-300" />}
          accentClass="bg-fuchsia-50 ring-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:ring-fuchsia-900/50"
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {recentPhotosClient.length === 0 ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Fotos recentes
                </h2>
                <Link
                  href="/photos"
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Ver todas
                </Link>
              </div>
              <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
                Nenhuma foto ainda.
              </div>
            </div>
          ) : (
            <PhotoCarousel photos={recentPhotosClient} />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recados recentes
            </h2>
            <Link
              href="/recados"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Ver todos
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
              Nenhum recado ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((n) => (
                <div
                  key={n.id}
                  className="group rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md dark:border-zinc-900 dark:bg-zinc-950"
                >
                  <div className="flex gap-3">
                    <div className="mt-1 h-4 w-1 shrink-0 rounded-full bg-zinc-200 transition-colors group-hover:bg-zinc-300 dark:bg-zinc-800 dark:group-hover:bg-zinc-700" />
                    <div className="min-w-0">
                      <div className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                        {n.body}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <div className="truncate">
                          {n.author.name || n.author.email}
                        </div>
                        <div className="shrink-0">{fmtRel(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
