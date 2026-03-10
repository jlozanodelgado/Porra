import React from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
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

    const { data: matches, error } = await supabase.from('matches').select(`
    *,
    home:home_team_id (name, flag_url),
    away:away_team_id (name, flag_url)
  `).order('kickoff_time', { ascending: true });

    if (error) {
        console.error('Error fetching matches:', error);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} />
            <main className="flex-1 overflow-y-auto p-6">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] uppercase tracking-tight">
                        Pronósticos Mundial
                    </h1>
                    <p className="text-gray-400 font-body mt-2">Tus predicciones, en tiempo real.</p>
                </header>

                <div className="flex justify-between items-center max-w-7xl mx-auto mb-6">
                    <h2 className="text-2xl font-bold font-heading text-white">Partidos</h2>
                    <a href="/leaderboard" className="text-sm font-semibold text-[var(--color-neon-cyan)] hover:brightness-125 transition-all">Ver Posiciones &rarr;</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {matches && matches.length > 0 ? matches.map((m: any) => (
                        <a key={m.id} href={`/match/${m.id}`} className="block">
                            <MatchCard
                                id={m.id}
                                homeTeam={m.home?.name || 'Local'}
                                awayTeam={m.away?.name || 'Visitante'}
                                homeFlag={m.home?.flag_url || ''}
                                awayFlag={m.away?.flag_url || ''}
                                kickoffTime={m.kickoff_time}
                                status={m.status}
                                homeGoalsReal={m.home_goals_real}
                                awayGoalsReal={m.away_goals_real}
                            />
                        </a>
                    )) : (
                        <div className="col-span-full text-center text-gray-500 italic py-10">
                            Aún no hay partidos registrados en la base de datos.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
