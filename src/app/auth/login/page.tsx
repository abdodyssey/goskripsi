import { AuthForm } from "@/features/auth/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left Side: Brand/Visual Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-700 dark:bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl">G</div>
            <span className="text-white font-bold text-2xl tracking-tight">GoSkripsi</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 max-w-lg">
            Sistem Informasi <br/>
            <span className="text-indigo-200">Manajemen Skripsi</span> Digital.
          </h1>
          <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
            Platform modern untuk pengelolaan administrasi skripsi Mahasiswa Fakultas Sains dan Teknologi UIN Raden Fatah Palembang.
          </p>
        </div>

        <div className="z-10">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-1 rounded-full bg-indigo-400" />
            <span className="text-indigo-200 text-sm font-medium tracking-wide uppercase">FST UIN Raden Fatah</span>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/4 -right-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-10" />
      </div>

      <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-1000">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
