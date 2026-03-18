import React from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { PredictionForm } from '@/components/matches/PredictionForm';
import { createClient } from '@/lib/supabase/server';
import { isMatchLocked } from '@/utils/date-helpers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const matchId = parseInt(id);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch match details
    const { data: fetchMatch, error } = await supabase.from('matches').select(`
    *,
    home:home_team_id (name, flag_url),
    away:away_team_id (name, flag_url)
  `).eq('id', matchId).single();

    if (error || !fetchMatch) {
        return <div className="p-10 text-center text-white">Partido no encontrado.</div>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = fetchMatch as any;

    // Fetch existing prediction for this user
    const { data: fetchPrediction } = await supabase.from('predictions')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prediction = fetchPrediction as any;

    const disabled = isMatchLocked(match.kickoff_time) || match.status === 'finished';

    // Fetch public predictions if the match is locked or finished
    let publicPredictions: any[] = [];
    if (disabled) {
        const { data: fetchPublicPreds } = await supabase
            .from('predictions')
            .select(`
                *,
                profiles(display_name, nickname, avatar_url)
            `)
            .eq('match_id', match.id)
            .order('points_earned', { ascending: false }); // Ordenar por puntos o por fecha
            
        publicPredictions = fetchPublicPreds || [];
    }

    // Fetch viewer profile for Sidebar (assuming 'user' is the viewer)
    const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('is_admin, display_name, nickname, avatar_url')
        .eq('id', user.id) // Use user.id as viewer.id
        .single();

    const viewerDisplayName = viewerProfile?.nickname || viewerProfile?.display_name || 'Usuario';
    const viewerAvatarUrl = viewerProfile?.avatar_url;
    const viewerNickname = viewerProfile?.nickname || '';

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar 
                isAdmin={viewerProfile?.is_admin || false} 
                displayName={viewerDisplayName} 
                avatarUrl={viewerAvatarUrl} 
                nickname={viewerNickname} 
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Luces Neón de Fondo */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-neon-cyan)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 flex justify-between items-center">
                        <a href="/dashboard" className="text-[var(--color-neon-cyan)] hover:underline font-semibold flex items-center gap-1 text-sm uppercase tracking-wider">
                            &larr; Volver al Dashboard
                        </a>
                    </header>

                    <div className="mb-8">
                        <MatchCard
                            id={match.id}
                            homeTeam={match.home?.name || 'Local'}
                            awayTeam={match.away?.name || 'Visitante'}
                            homeFlag={match.home?.flag_url || ''}
                            awayFlag={match.away?.flag_url || ''}
                            kickoffTime={match.kickoff_time}
                            status={match.status}
                            homeGoalsReal={match.home_goals_real}
                            awayGoalsReal={match.away_goals_real}
                        />
                    </div>

                    <div className="mb-12 bg-[var(--color-surface)]/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
                        <h2 className="text-xl font-heading font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                             <span className="w-1 h-6 bg-[var(--color-neon-purple)] rounded-full"></span>
                             Tu Pronóstico
                        </h2>
                        <PredictionForm
                            matchId={match.id}
                            userId={user.id}
                            initialHomeGoals={prediction?.home_goals_pred}
                            initialAwayGoals={prediction?.away_goals_pred}
                            disabled={disabled}
                        />
                    </div>

                    <div className="bg-[var(--color-surface)]/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <h3 className="text-lg font-heading font-black text-gray-300 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-6 bg-gray-500 rounded-full"></span>
                            Pronósticos de la Comunidad
                        </h3>
                        {disabled ? (
                            publicPredictions.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {publicPredictions.map((p) => (
                                        <div key={p.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center group hover:border-[var(--color-neon-cyan)]/30 transition-all">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 mb-3 bg-white/5 shadow-inner">
                                                <img 
                                                    src={p.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.profiles?.nickname || p.user_id)}`} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mb-3 truncate max-w-full">
                                                {p.profiles?.nickname || p.profiles?.display_name || 'Usuario'}
                                            </p>
                                            <div className="flex items-center gap-4 text-2xl font-heading font-black text-white mb-2 bg-white/5 px-4 py-1 rounded-xl">
                                                <span>{p.home_goals_pred}</span>
                                                <span className="text-gray-600 text-sm">-</span>
                                                <span>{p.away_goals_pred}</span>
                                            </div>
                                            {match.status === 'finished' && (
                                                <div className="mt-2 px-3 py-1 rounded-full bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/20">
                                                    <p className="text-[10px] font-black text-[var(--color-neon-green)] tracking-widest uppercase">
                                                        +{p.points_earned} PTS
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-white/5">
                                    <p className="text-gray-500 font-medium italic">Nadie hizo pronósticos para este partido.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-16 bg-black/20 rounded-2xl border border-dashed border-white/5">
                                <p className="text-gray-500 font-bold italic uppercase tracking-widest text-sm">
                                    Resultados Ocultos
                                </p>
                                <p className="text-xs text-gray-600 mt-2 font-medium">
                                    Aparecerán cuando falten menos de 15 minutos para el pitazo inicial.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
