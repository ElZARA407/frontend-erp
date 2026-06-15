import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_45%,_#020617_100%)] px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
