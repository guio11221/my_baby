"use server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { redirect } from "next/navigation";

import { createSession, hashPassword } from "@/lib/auth";
import { requireCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

function getString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
}

function safeExt(filename: string): string {
  const ext = path.extname(filename || "").toLowerCase();
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") return ext;
  return "";
}

export async function addNoteAction(formData: FormData) {
  const { user, couple } = await requireCouple();
  const body = getString(formData, "body");
  if (!body) redirect("/recados?error=Recado%20vazio");

  await prisma.note.create({
    data: { body, authorId: user.id, coupleId: couple.id },
  });

  redirect("/recados");
}

export async function deleteNoteAction(formData: FormData) {
  const { couple } = await requireCouple();
  const id = getString(formData, "id");
  if (!id) redirect("/recados");

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.coupleId !== couple.id) redirect("/recados");

  await prisma.note.delete({ where: { id } }).catch(() => null);
  redirect("/recados");
}

export async function addPhotoAction(formData: FormData) {
  const { user, couple } = await requireCouple();

  const caption = getString(formData, "caption");
  const filesRaw = formData.getAll("files");
  const files = filesRaw.filter((f): f is File => f instanceof File);
  if (files.length === 0) redirect("/photos/new?error=Arquivo%20invalido");
  if (files.length > 12) redirect("/photos/new?error=Maximo%2012%20fotos%20por%20vez");

  const uploadsDir = await ensureUploadsDir();
  const created: { src: string; caption: string | null; userId: string; coupleId: string }[] =
    [];

  for (const file of files) {
    if (file.size <= 0) redirect("/photos/new?error=Arquivo%20vazio");
    if (file.size > 10 * 1024 * 1024) redirect("/photos/new?error=Maximo%2010MB%20por%20foto");

    const ext = safeExt(file.name);
    if (!ext) redirect("/photos/new?error=Formato%20nao%20suportado");

    const name = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const abs = path.join(uploadsDir, name);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(abs, buf);

    created.push({
      src: `/uploads/${name}`,
      caption: caption || null,
      userId: user.id,
      coupleId: couple.id,
    });
  }

  await prisma.photo.createMany({ data: created });

  redirect("/photos");
}

export async function deletePhotoAction(formData: FormData) {
  const { couple } = await requireCouple();
  const id = getString(formData, "id");
  if (!id) redirect("/photos");

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.coupleId !== couple.id) redirect("/photos");

  // Best-effort: remove file, but don't block DB delete.
  try {
    const rel = photo.src.startsWith("/uploads/") ? photo.src.slice(1) : null;
    if (rel) {
      const abs = path.join(process.cwd(), "public", rel);
      await fs.unlink(abs);
    }
  } catch {
    // ignore
  }

  await prisma.photo.delete({ where: { id } }).catch(() => null);
  redirect("/photos");
}

export async function createInviteAction(formData: FormData) {
  const { user, couple } = await requireCouple();

  const email = getString(formData, "email").toLowerCase();
  if (!email || !email.includes("@")) redirect("/usuarios?error=Email%20invalido");

  const raw = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

  try {
    await prisma.invite.create({
      data: {
        tokenHash,
        email,
        coupleId: couple.id,
        createdById: user.id,
        expiresAt,
      },
    });
  } catch {
    redirect("/usuarios?error=Nao%20foi%20possivel%20criar%20convite");
  }

  redirect(`/usuarios?invite=${encodeURIComponent(raw)}&to=${encodeURIComponent(email)}`);
}

export async function acceptInviteCreateAccountAction(formData: FormData) {
  const token = getString(formData, "token");
  const name = getString(formData, "name");
  const password = getString(formData, "password");
  const password2 = getString(formData, "password2");

  if (!token) redirect("/login?error=Convite%20invalido");
  if (password.length < 6) redirect(`/invite/${encodeURIComponent(token)}?error=Senha%20muito%20curta`);
  if (password !== password2) redirect(`/invite/${encodeURIComponent(token)}?error=As%20senhas%20nao%20batem`);

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    include: { couple: true },
  });

  if (!invite) redirect(`/invite/${encodeURIComponent(token)}?error=Convite%20invalido`);
  if (invite.acceptedAt) redirect(`/invite/${encodeURIComponent(token)}?error=Convite%20ja%20usado`);
  if (invite.expiresAt.getTime() < Date.now()) redirect(`/invite/${encodeURIComponent(token)}?error=Convite%20expirado`);

  const passwordHash = await hashPassword(password);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: invite.email, name: name || null, passwordHash },
      });
      await tx.membership.create({
        data: { userId: user.id, coupleId: invite.coupleId, role: "MEMBER" },
      });
      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date(), acceptedById: user.id },
      });
      return user;
    });

    await createSession(created.id);
    redirect("/dashboard");
  } catch {
    redirect(`/invite/${encodeURIComponent(token)}?error=Nao%20foi%20possivel%20aceitar%20o%20convite`);
  }
}
