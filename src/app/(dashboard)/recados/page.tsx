import { addNoteAction, deleteNoteAction } from "@/app/(dashboard)/dashboard.actions";
import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export default async function RecadosPage({
  searchParams,
}: {
  searchParams?: { error?: string } | Promise<{ error?: string }>;
}) {
  const { couple } = await requireCouple();
  const { error } = await Promise.resolve(searchParams ?? {});

  const notes = await prisma.note.findMany({
    where: { coupleId: couple.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Recados
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Mensagens simples que ficam salvas no SQLite.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form
        action={addNoteAction}
        className="space-y-3 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950"
      >
        <textarea
          name="body"
          rows={3}
          className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="Escreve um recadinho..."
          required
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          Postar
        </button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
            Nenhum recado ainda.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950"
            >
              <div className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
                {n.body}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-zinc-500">
                  {n.author.name || n.author.email}
                </div>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    Apagar
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
