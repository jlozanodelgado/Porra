import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MenuHub from '@/components/layout/MenuHub';
import Sidebar from '@/components/layout/Sidebar';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let displayName = '';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, display_name')
      .eq('id', user.id)
      .single();

    isAdmin = profile?.is_admin || false;
    displayName = profile?.display_name || 'Usuario';
  }

  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
        <Sidebar isAdmin={isAdmin} displayName={displayName} />
        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          {/* Luces Neón de Fondo */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-neon-cyan)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-neon-purple)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter mb-2">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)]">{displayName}</span>
            </h1>
            <p className="text-gray-400 font-medium">Panel de Control Mundial Norteamérica 2026</p>
          </header>

          <MenuHub isAdmin={isAdmin} />
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Luces Neón de Fondo */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-neon-purple)]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-neon-green)]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-3xl flex flex-col items-center">
        <div className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-semibold text-sm mb-6 tracking-wider">
          FUTBOL TOTAL 2026
        </div>

        <h1 className="text-6xl md:text-8xl font-heading font-black text-white mb-6 leading-tight drop-shadow-2xl uppercase">
          La Gran <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)] filter drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]">
            Porra Mundial
          </span>
        </h1>

        <p className="text-xl text-gray-400 font-body mb-10 leading-relaxed max-w-2xl">
          Demuestra que eres el rey de los pronósticos. Adivina los resultados de Norteamérica 2026, compite contra tus amigos y llévate la gloria (y el premio).
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl bg-[var(--color-neon-green)] text-black font-heading font-bold text-lg hover:bg-[#4aff2a] hover:scale-105 transition-all shadow-[0_0_20px_var(--color-neon-green)] text-center"
          >
            Inscribirse Ahora
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-transparent border-2 border-[var(--color-neon-purple)] text-white font-heading font-bold text-lg hover:bg-[var(--color-neon-purple)]/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(176,38,255,0.3)] text-center"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-[var(--color-neon-green)] font-heading font-bold text-xl mb-2">1. Regístrate</h3>
            <p className="text-gray-400 text-sm">Crea tu cuenta en menos de 1 minuto y prepara tus conocimientos.</p>
          </div>
          <div className="bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-[var(--color-neon-cyan)] font-heading font-bold text-xl mb-2">2. Pronostica</h3>
            <p className="text-gray-400 text-sm">Ingresa tus resultados antes de que falten 15 minutos para cada partido.</p>
          </div>
          <div className="bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-[var(--color-neon-red)] font-heading font-bold text-xl mb-2">3. Gana</h3>
            <p className="text-gray-400 text-sm">Suma puntos por ganador, goles o marcador exacto y escala en la tabla.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
