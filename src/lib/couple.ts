import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireCouple() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findUnique({
    where: { userId: user.id },
    include: { couple: true },
  });

  if (!membership) {
    // Usuario existe mas nao esta vinculado a nenhum casal.
    redirect("/signup");
  }

  return { user, membership, couple: membership.couple };
}

