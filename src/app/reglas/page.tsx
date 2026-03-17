import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { Shield, Trophy, Target, Star, AlertCircle, Info } from 'lucide-react';

export default async function RulesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('display_name, is_admin')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="flex min-h-screen bg-background text-white font-body">
            {profile && <Sidebar isAdmin={profile.is_admin} displayName={profile.display_name} />}
            
            <main className={`flex-1 ${profile ? 'lg:ml-64' : ''} p-4 md:p-8`}>
                <div className="max-w-4xl mx-auto space-y-12 pb-20">
                    
                    {/* Header */}
                    <div className="text-center space-y-4 pt-8">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/20 shadow-[0_0_20px_rgba(0,255,255,0.1)] mb-4">
                            <Shield className="text-[var(--color-neon-cyan)]" size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter italic">
                            Reglas de la <span className="text-[var(--color-neon-cyan)]">Porra</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            Todo lo que necesitas saber sobre el sistema de puntos y la distribución de premios del Mundial 2026.
                        </p>
                    </div>

                    {/* Scoring System */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="text-[var(--color-neon-green)]" size={24} />
                            <h2 className="text-2xl font-heading font-bold uppercase italic">Sistema de Puntuación</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-[var(--color-neon-green)] font-bold uppercase tracking-wider text-sm">Fase de Grupos</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-300">Acierto Marcador Exacto</span>
                                        <span className="bg-[var(--color-neon-green)] text-black font-black px-3 py-1 rounded-lg text-sm">5 Pts</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Acierto Ganador + Goles de 1 equipo</span>
                                        <span className="text-[var(--color-neon-green)] font-bold">2 Pts</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Solo Acierto de Marcador (W/D/L)</span>
                                        <span className="text-[var(--color-neon-green)] font-bold">1 Pt</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Solo Goles de un equipo</span>
                                        <span className="text-[var(--color-neon-green)] font-bold">1 Pt</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-surface/40 backdrop-blur-md border border-[var(--color-neon-purple)]/30 rounded-2xl p-6 space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3">
                                    <Star className="text-[var(--color-neon-purple)] animate-pulse" size={20} />
                                </div>
                                <h3 className="text-[var(--color-neon-purple)] font-bold uppercase tracking-wider text-sm">Playoffs (Puntos Dobles)</h3>
                                <ul className="space-y-3">
                                    <li className="flex justify-between items-center bg-[var(--color-neon-purple)]/10 p-3 rounded-xl border border-[var(--color-neon-purple)]/20 shadow-[0_0_15px_rgba(176,38,255,0.1)]">
                                        <span className="text-gray-200">Acierto Marcador Exacto</span>
                                        <span className="bg-[var(--color-neon-purple)] text-white font-black px-3 py-1 rounded-lg text-sm shadow-[0_0_10px_rgba(176,38,255,0.5)]">10 Pts</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Acierto Ganador + Goles de 1 equipo</span>
                                        <span className="text-[var(--color-neon-purple)] font-bold">4 Pts</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Solo Acierto de Marcador</span>
                                        <span className="text-[var(--color-neon-purple)] font-bold">2 Pts</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-gray-300">Solo Goles de un equipo</span>
                                        <span className="text-[var(--color-neon-purple)] font-bold">2 Pts</span>
                                    </li>
                                </ul>
                                <p className="text-[10px] text-[var(--color-neon-purple)] uppercase font-bold text-center mt-2 opacity-70">
                                    * Aplica para Octavos, Cuartos, Semis y Final
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Prize Distribution */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-[var(--color-neon-cyan)]" size={24} />
                            <h2 className="text-2xl font-heading font-bold uppercase italic">Distribución de Premios</h2>
                        </div>

                        <div className="bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-neon-cyan)]/10 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-neon-green)]/10 rounded-full blur-[80px]" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                                <div className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 text-center space-y-2">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">1er Puesto</p>
                                    <p className="text-5xl font-heading font-black text-[var(--color-neon-cyan)] drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">70%</p>
                                    <p className="text-[10px] text-gray-500 italic">Del total recaudado</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">2do Puesto</p>
                                    <p className="text-4xl font-heading font-black text-white/90">10%</p>
                                    <p className="text-[10px] text-gray-500 italic">Del total recaudado</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">3er Puesto</p>
                                    <p className="text-4xl font-heading font-black text-white/70">5%</p>
                                    <p className="text-[10px] text-gray-500 italic">Del total recaudado</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-[var(--color-neon-red)]/5 border border-[var(--color-neon-red)]/20 text-center space-y-2">
                                    <p className="text-xs text-[var(--color-neon-red)] uppercase font-bold tracking-widest opacity-70">Plataforma</p>
                                    <p className="text-4xl font-heading font-black text-[var(--color-neon-red)]">15%</p>
                                    <p className="text-[10px] text-gray-500 italic">Gastos y Casa</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Important Rules / Ties */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Info className="text-white" size={24} />
                            <h2 className="text-2xl font-heading font-bold uppercase italic">Reglas de Empate</h2>
                        </div>
                        
                        <div className="bg-[var(--color-neon-red)]/10 border border-[var(--color-neon-red)]/20 rounded-2xl p-6 flex gap-4 items-start">
                            <AlertCircle className="text-[var(--color-neon-red)] shrink-0 mt-1" size={24} />
                            <div className="space-y-3">
                                <p className="text-white font-medium">En caso de igualdad de puntos en la tabla de clasificación:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                                    <li>Si existe un <span className="text-white font-bold">empate en el 1er lugar</span>, los ganadores se dividirán el premio (70% + 10%) y <span className="text-[var(--color-neon-red)] font-bold">se anulará el 2do puesto</span>.</li>
                                    <li>De la misma manera, si existe un <span className="text-white font-bold">empate en el 2do lugar</span>, se repartirán el premio correspondiente y <span className="text-[var(--color-neon-red)] font-bold">se anulará el 3er puesto</span>.</li>
                                    <li>Para los partidos de <span className="text-white font-bold">Eliminación Directa (Playoffs)</span>, solo será válido el marcador de los <span className="text-[var(--color-neon-cyan)] font-bold">90 minutos reglamentarios</span> (incluyendo el tiempo añadido por el juez). No se tendrá en cuenta el resultado de la prórroga ni de la tanda de penaltis.</li>
                                    <li>Las reglas de bloqueo son estrictas: No se pueden realizar o editar pronósticos faltando <span className="text-white font-bold">15 minutos o menos</span> para el inicio del partido.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
