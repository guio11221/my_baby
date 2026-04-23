import Image from "next/image";
import Link from "next/link";

import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

function monthLabel(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams?: { error?: string } | Promise<{ error?: string }>;
}) {
  const { couple } = await requireCouple();
  const { error } = await Promise.resolve(searchParams ?? {});

  const photos = await prisma.photo.findMany({
    where: { coupleId: couple.id },
    orderBy: { createdAt: "desc" },
    take: 240,
    include: { user: true },
  });

  const groups = new Map<string, typeof photos>();
  for (const p of photos) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const arr = groups.get(key);
    if (arr) arr.push(p);
    else groups.set(key, [p]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Fotos
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Organizadas por mes.
          </p>
        </div>
        <Link
          href="/photos/new"
          className="h-9 shrink-0 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          Adicionar
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {photos.length === 0 ? (
        <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
          Nenhuma foto ainda.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([key, items]) => (
            <section key={key} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                  {monthLabel(items[0]!.createdAt)}
                </h2>
                <div className="text-xs text-zinc-500">{items.length} fotos</div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/photos/${p.id}`}
                    className="group relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-900"
                  >
                    <Image
                      src={p.src}
                      alt={p.caption || "Foto"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="truncate">{p.caption || "Sem legenda"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
