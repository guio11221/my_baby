import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/(auth)/auth.actions";
import { prisma } from "@/lib/prisma";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string } | Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await Promise.resolve(searchParams ?? {});
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect("/setup");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4 dark:from-gray-900 dark:to-blue-950 overflow-hidden">
      {/* Animação de fundo abstrata: gradientes sutis e fluidos */}
      <div className="absolute inset-0 z-0 opacity-30 animate-gradient-xy">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-green-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animation-delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 bg-gradient-to-tr from-pink-300 to-red-300 rounded-full mix-blend-multiply filter blur-3xl animation-delay-4000"></div>
      </div>

      <main className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          Bem-vindo de Volta!
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
          Entre para continuar acompanhando cada momento especial do seu bebê.
        </p>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-5">
          <input type="hidden" name="next" value={next || ""} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Email de Acesso
            </label>
            <input
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-base text-gray-900 outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 shadow-sm"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Senha Secreta
            </label>
            <input
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-base text-gray-900 outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 shadow-sm"
              autoComplete="current-password"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-blue-600 px-4 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            Entrar no Cantinho
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
          Primeiro acesso?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
            Crie seu Cantinho aqui
          </Link>
        </p>
      </main>
    </div>
  );
}
