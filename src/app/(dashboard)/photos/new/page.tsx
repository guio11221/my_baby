import Link from "next/link";

import { addPhotoAction } from "@/app/(dashboard)/dashboard.actions";
import { requireCouple } from "@/lib/couple";

export default async function NewPhotoPage({
  searchParams,
}: {
  searchParams?: { error?: string } | Promise<{ error?: string }>;
}) {
  await requireCouple();
  const { error } = await Promise.resolve(searchParams ?? {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nova foto
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Selecione uma ou varias (PNG/JPG/WebP, ate 10MB cada).
          </p>
        </div>
        <Link
          href="/photos"
          className="h-9 shrink-0 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Voltar
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form
        action={addPhotoAction}
        className="space-y-4 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Arquivos
          </label>
          <input
            name="files"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            required
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-50 dark:file:text-zinc-900 dark:hover:file:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Legenda (opcional, aplica em todas)
          </label>
          <input
            name="caption"
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
