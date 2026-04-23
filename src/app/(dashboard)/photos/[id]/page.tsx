import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { deletePhotoAction } from "@/app/(dashboard)/dashboard.actions";
import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export default async function PhotoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { couple } = await requireCouple();
  const { id } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!photo || photo.coupleId !== couple.id) redirect("/photos");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Foto
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {photo.user.name || photo.user.email} •{" "}
            {photo.createdAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <Link
          href="/photos"
          className="h-9 shrink-0 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Voltar
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
        <div className="relative aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={photo.src}
            alt={photo.caption || "Foto"}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {photo.caption || "Sem legenda"}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{photo.src}</div>
          </div>
          <form action={deletePhotoAction}>
            <input type="hidden" name="id" value={photo.id} />
            <button
              type="submit"
              className="h-9 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Apagar foto
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

