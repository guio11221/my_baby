"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type PhotoItem = {
  id: string;
  src: string;
  caption: string | null;
  createdAt: string; // ISO
};

function fmtRel(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 14) return `${days} dias`;
  return d.toISOString().slice(0, 10);
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-5 w-5"}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevron({
  dir,
  className,
}: {
  dir: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-5 w-5"}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={dir === "left" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lightbox({
  photo,
  onClose,
}: {
  photo: PhotoItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-zinc-950 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {photo.caption || "Sem legenda"}
            </div>
            <div className="mt-0.5 text-xs text-white/70">{fmtRel(photo.createdAt)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/photos/${photo.id}`}
              className="h-9 rounded-md bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/15"
            >
              Abrir detalhes
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white hover:bg-white/15"
              aria-label="Fechar"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full bg-black">
          <Image
            src={photo.src}
            alt={photo.caption || "Foto"}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export function PhotoCarousel({ photos }: { photos: PhotoItem[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<PhotoItem | null>(null);

  const hasMany = photos.length > 1;

  const slides = useMemo(() => photos.slice(0, 12), [photos]);

  function scrollByPages(dir: -1 | 1) {
    const el = viewportRef.current;
    if (!el) return;
    const delta = Math.max(240, Math.floor(el.clientWidth * 0.9)) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {active ? <Lightbox photo={active} onClose={() => setActive(null)} /> : null}

      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Fotos recentes
          </h2>
          <div className="mt-0.5 text-xs text-zinc-500">
            Clique pra abrir em tela cheia.
          </div>
        </div>
        <Link
          href="/photos"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        <div className="relative">
          {hasMany ? (
            <>
              <button
                type="button"
                onClick={() => scrollByPages(-1)}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-white dark:bg-zinc-950/80 dark:text-zinc-50 dark:ring-zinc-800"
                aria-label="Anterior"
              >
                <IconChevron dir="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollByPages(1)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-white dark:bg-zinc-950/80 dark:text-zinc-50 dark:ring-zinc-800"
                aria-label="Proxima"
              >
                <IconChevron dir="right" />
              </button>
            </>
          ) : null}

          <div
            ref={viewportRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p)}
                className="group relative snap-start shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-inset ring-zinc-200 transition-transform hover:-translate-y-0.5 hover:scale-[1.01] dark:bg-zinc-900 dark:ring-zinc-800"
                style={{ width: 220 }}
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={p.src}
                    alt={p.caption || "Foto"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    sizes="220px"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="truncate text-xs font-medium">
                    {p.caption || "Sem legenda"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/80">
                    {fmtRel(p.createdAt)}
                  </div>
                </div>
              </button>
            ))}

            {photos.length > slides.length ? (
              <Link
                href="/photos"
                className="snap-start shrink-0 grid place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                style={{ width: 220 }}
              >
                Ver mais
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

