"use server";

import { redirect } from "next/navigation";

import { clearSession, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function setupAction(formData: FormData) {
  // Back-compat: /setup virou /signup.
  redirect("/signup");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const next = getString(formData, "next") || "/dashboard";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect(`/login?error=Credenciais%20invalidas&next=${encodeURIComponent(next)}`);

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) redirect(`/login?error=Credenciais%20invalidas&next=${encodeURIComponent(next)}`);

  await createSession(user.id);
  redirect(next);
}

export async function signupAction(formData: FormData) {
  const coupleName = getString(formData, "coupleName");
  const email = getString(formData, "email").toLowerCase();
  const name = getString(formData, "name");
  const password = getString(formData, "password");
  const password2 = getString(formData, "password2");

  if (!coupleName) redirect("/signup?error=Nome%20do%20cantinho%20obrigatorio");
  if (!email || !email.includes("@")) redirect("/signup?error=Email%20invalido");
  if (password.length < 6) redirect("/signup?error=Senha%20muito%20curta");
  if (password !== password2) redirect("/signup?error=As%20senhas%20nao%20batem");

  const passwordHash = await hashPassword(password);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name: name || null, passwordHash },
      });
      const couple = await tx.couple.create({
        data: { name: coupleName },
      });
      await tx.membership.create({
        data: { userId: user.id, coupleId: couple.id, role: "OWNER" },
      });
      return { user, couple };
    });

    await createSession(created.user.id);
    redirect("/dashboard");
  } catch {
    redirect("/signup?error=Email%20ja%20existe");
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
