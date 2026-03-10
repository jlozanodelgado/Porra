import React from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { PredictionForm } from '@/components/matches/PredictionForm';
import { createClient } from '@/lib/supabase/server';
import { isMatchLocked } from '@/utils/date-helpers';
import { redirect } from 'next/navigation';

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

    const disabled = isMatchLocked(match.kickoff_time);

    return (
        <main className="min-h-screen bg-[var(--color-background)] p-6 flex flex-col items-center">
            <header className="mb-6 w-full max-w-4xl flex justify-between items-center">
                <a href="/dashboard" className="text-[var(--color-neon-cyan)] hover:underline font-semibold flex items-center gap-1">
                    &larr; Volver al Dashboard
                </a>
            </header>

            <div className="w-full max-w-4xl mb-8">
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

            <div className="w-full max-w-4xl">
                <h2 className="text-xl font-heading font-bold text-white mb-4 text-center">Tu Pronóstico</h2>
                <PredictionForm
                    matchId={match.id}
                    userId={user.id}
                    initialHomeGoals={prediction?.home_goals_pred}
                    initialAwayGoals={prediction?.away_goals_pred}
                    disabled={disabled || match.status === 'finished'}
                />
            </div>

            <div className="w-full max-w-4xl mt-12 bg-[var(--color-surface)]/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-heading text-gray-300 mb-4 border-b border-white/10 pb-2">
                    Pronósticos Públicos
                </h3>
                {disabled ? (
                    <p className="text-gray-400 text-center py-4">Los pronósticos de otros jugadores aparecerán aquí pronto.</p>
                ) : (
                    <p className="text-gray-500 italic text-center py-8">
                        Ocultos. Aparecerán cuando falten menos de 15 minutos para el partido.
                    </p>
                )}
            </div>
        </main>
    );
}
