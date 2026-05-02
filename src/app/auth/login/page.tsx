import Image from "next/image";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function LoginPage() {
  return (
    <div className="h-screen max-h-screen grid lg:grid-cols-[45%_55%] bg-slate-50 overflow-hidden">
      {/* Left Side: Brand/Visual Section */}
      <div className="hidden lg:flex flex-col justify-between p-16 academic-pattern relative overflow-hidden h-full border-r border-black/10">
        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy via-transparent to-transparent opacity-60" />
        
        <div className="z-10">
          <div className="flex items-center gap-4 mb-16 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center p-2.5 border border-white/10 shadow-2xl">
              <Image 
                src="/uin-logo.png" 
                alt="UIN Logo" 
                width={48} 
                height={48} 
                className="object-contain brightness-0 invert opacity-90" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-normal text-2xl tracking-tight gs-display" style={{ fontStyle: 'normal' }}>GoSkripsi</span>
              <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold">Digital Academic Portal</span>
            </div>
          </div>
          
          <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <h1 className="gs-display text-white">
              Sistem Informasi <br/>
              Penelitian Mahasiswa.
            </h1>
            <div className="h-1.5 w-20 bg-brand-gold rounded-full" />
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Platform terpadu untuk pengelolaan administrasi skripsi dan penelitian Mahasiswa Fakultas Sains dan Teknologi.
            </p>
          </div>
        </div>

        <div className="z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1 font-semibold">Lembaga Terkait</span>
              <span className="text-brand-gold-muted text-sm font-semibold tracking-wide">FST UIN RADEN FATAH PALEMBANG</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative bg-slate-50">
        {/* Subtle background grounding */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="w-full max-w-[460px] z-10">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <Image src="/uin-logo.png" alt="UIN Logo" width={40} height={40} className="object-contain" />
            <span className="text-brand-navy font-normal text-2xl tracking-tight gs-display" style={{ fontStyle: 'normal' }}>
              GoSkripsi
            </span>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <AuthForm />
          </div>
          
          <div className="mt-12 text-center lg:text-left animate-in fade-in duration-1000 delay-700">
            <p className="text-slate-400 text-xs font-medium tracking-wide">
              &copy; {new Date().getFullYear()} <span className="text-slate-500 font-semibold">Fakultas Sains dan Teknologi</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
