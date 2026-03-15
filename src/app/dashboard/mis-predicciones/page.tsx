import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { formatToColombiaTime, isMatchLocked } from '@/utils/date-helpers';
import { PredictionForm } from '@/components/matches/PredictionForm';

export default async function MisPrediccionesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.display_name || 'Usuario';

    // Obtener predicciones del usuario conectadas con los partidos
    const { data: predictions, error } = await supabase
        .from('predictions')
        .select(`
            id,
            home_goals_pred,
            away_goals_pred,
            points_earned,
            match_id,
            matches (
                id,
                kickoff_time,
                status,
                home_team_id,
                away_team_id,
                home:home_team_id (name, flag_url),
                away:away_team_id (name, flag_url)
            )
        `)
        .eq('user_id', user.id)
        .order('matches(kickoff_time)', { ascending: true }); // Nota: ordenar por tabla foránea en Supabase

    if (error) {
        console.error('Error fetching user predictions:', error);
    }

    // Ordenamiento manual si supabase no ordenó correctamente la relación
    const sortedPredictions = predictions?.sort((a: any, b: any) => {
        const dateA = new Date(a.matches?.kickoff_time).getTime();
        const dateB = new Date(b.matches?.kickoff_time).getTime();
        return dateA - dateB;
    });

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} />
            <main className="flex-1 overflow-y-auto p-6">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-purple)]/10 border border-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] text-xs font-bold uppercase tracking-widest mb-4">
                        <BookOpen size={14} />
                        Mis Predicciones
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white uppercase">Tus Pronósticos</h1>
                    <p className="text-gray-400 mt-2">Aquí puedes ver y editar tus pronósticos realizados (si faltan más de 15 minutos).</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {sortedPredictions && sortedPredictions.length > 0 ? sortedPredictions.map((p: any) => {
                        const m = p.matches;
                        if (!m) return null;
                        
                        const isLocked = isMatchLocked(m.kickoff_time) || m.status === 'finished';

                        return (
                            <div key={p.id} className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all shadow-xl flex flex-col relative">
                                {isLocked && (
                                    <div className="absolute top-0 right-0 left-0 bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)] text-center text-xs font-bold py-1 z-10 uppercase tracking-widest backdrop-blur-md border-b border-[var(--color-neon-red)]/20">
                                        Partido Bloqueado Cerrado
                                    </div>
                                )}
                                
                                <div className="p-5 flex-1 pt-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex flex-col items-center gap-2 w-[40%] text-center">
                                            {m.home?.flag_url ? (
                                                <img src={m.home.flag_url} alt={m.home.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-lg" loading="lazy" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
                                            )}
                                            <span className="text-white font-heading font-bold uppercase text-sm">{m.home?.name || 'Local'}</span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center w-[20%]">
                                            <span className="text-xs text-gray-500 font-bold mb-1">vs</span>
                                            {m.status === 'finished' && (
                                                <span className="px-2 py-0.5 rounded bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] text-[10px] uppercase font-bold text-center">
                                                    Pts: {p.points_earned}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-2 w-[40%] text-center">
                                            {m.away?.flag_url ? (
                                                <img src={m.away.flag_url} alt={m.away.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-lg" loading="lazy" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
                                            )}
                                            <span className="text-white font-heading font-bold uppercase text-sm">{m.away?.name || 'Visitante'}</span>
                                        </div>
                                    </div>

                                    <div className="text-center mb-4 pb-4 border-b border-white/5">
                                        <p className="text-xs text-[var(--color-neon-cyan)] font-semibold uppercase tracking-wider">
                                            {formatToColombiaTime(m.kickoff_time)}
                                        </p>
                                    </div>

                                    <PredictionForm 
                                        matchId={m.id} 
                                        userId={user.id} 
                                        initialHomeGoals={p.home_goals_pred} 
                                        initialAwayGoals={p.away_goals_pred} 
                                        disabled={isLocked} 
                                    />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full text-center text-gray-500 italic py-10 bg-[var(--color-surface)]/20 border border-dashed border-white/10 rounded-2xl p-20">
                            Aún no has realizado ninguna predicción. ¡Inscríbite en tus pronósticos en la sección Partidos!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
