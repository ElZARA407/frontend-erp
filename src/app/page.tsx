import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          CMP ERP
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Interface prête pour connecter votre backend Laravel.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          La structure frontend est maintenant en place pour construire le
          login, le tableau de bord et les modules métiers.
        </p>
        <Link
          href="/login"
          className="inline-flex w-fit rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
        >
          Aller au login
        </Link>
      </div>
    </main>
  );
}
