import React from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import MenuHub from '@/components/layout/MenuHub';
import AvatarUpload from '@/components/profile/AvatarUpload';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, is_admin, display_name, nickname, avatar_url, total_points')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.nickname || profile?.display_name || 'Usuario';
    const avatarUrl = profile?.avatar_url || null;
    const nickname = profile?.nickname || '';

    const { data: matches, error } = await supabase.from('matches').select(`
    *,
    home:home_team_id (name, flag_url),
    away:away_team_id (name, flag_url)
  `).order('kickoff_time', { ascending: true });

    // Obtener las predicciones del usuario para estos partidos
    const { data: userPredictions } = await supabase
        .from('predictions')
        .select('match_id, home_goals_pred, away_goals_pred')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching matches:', error);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} avatarUrl={avatarUrl} nickname={nickname} />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Luces Neón de Fondo */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-neon-cyan)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-neon-purple)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-[var(--color-surface)]/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                        <AvatarUpload 
                            userId={user.id} 
                            currentAvatarUrl={avatarUrl} 
                            nickname={nickname} 
                        />
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter mb-2">
                                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)]">{displayName}</span>
                            </h1>
                            <p className="text-gray-400 font-medium tracking-wide">¡Es hora de demostrar tus conocimientos! Tienes {profile?.total_points || 0} puntos.</p>
                        </div>
                        <div className="hidden lg:flex flex-col gap-3 ml-auto">
                             <a href="/profile" className="px-6 py-3 rounded-xl bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 text-sm font-bold text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black transition-all uppercase tracking-widest text-center">
                                 Mi Perfil
                             </a>
                             <a href="/leaderboard" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-center">
                                 Ver Posiciones
                             </a>
                        </div>
                    </header>

                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold font-heading text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="w-2 h-8 bg-[var(--color-neon-cyan)] rounded-full shadow-[0_0_10px_var(--color-neon-cyan)]"></span>
                            Próximos Partidos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {matches && matches.length > 0 ? matches.map((m: any) => {
                            const prediction = userPredictions?.find(p => p.match_id === m.id);
                            return (
                                <a key={m.id} href={`/match/${m.id}`} className="block transform hover:scale-[1.02] transition-all">
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
                                        prediction={prediction ? {
                                            homeGoals: prediction.home_goals_pred,
                                            awayGoals: prediction.away_goals_pred
                                        } : undefined}
                                    />
                                </a>
                            );
                        }) : (
                            <div className="col-span-full text-center text-gray-500 italic py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                Aún no hay partidos registrados en la base de datos.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
