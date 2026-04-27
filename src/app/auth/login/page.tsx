import { AuthForm } from "@/features/auth/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-50/30 dark:bg-indigo-900/10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/20 dark:bg-indigo-800/5" />

      <div className="z-10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
        <AuthForm />
      </div>
    </div>
  );
}
