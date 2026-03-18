import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { redirect, notFound } from 'next/navigation';
import { User, ShieldCheck, Clock, Trophy } from 'lucide-react';
import { formatToColombiaTime, isMatchLocked } from '@/utils/date-helpers';

export default async function UserPredictionsPage({ params }: { params: { userId: string } }) {
    const { userId } = await params;
    const supabase = await createClient();

    // 1. Verificar sesión del visualizador
    const { data: { user: viewer } } = await supabase.auth.getUser();
    if (!viewer) redirect('/login');

    // 2. Obtener perfil del usuario que estamos viendo
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, nickname, is_admin, total_points, avatar_url')
        .eq('id', userId)
        .single();

    if (!profile) notFound();

    // 3. Obtener perfil del espectador (para el Sidebar)
    const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('is_admin, display_name, nickname, avatar_url')
        .eq('id', viewer.id)
        .single();

    const isAdminViewer = viewerProfile?.is_admin || false;
    const viewerDisplayName = viewerProfile?.nickname || viewerProfile?.display_name || 'Usuario';
    const viewerAvatarUrl = viewerProfile?.avatar_url;
    const viewerNickname = viewerProfile?.nickname || '';
    
    const profileName = profile?.nickname || profile?.display_name || 'Usuario';
    const profileAvatarUrl = profile?.avatar_url;

    // 4. Obtener predicciones del usuario
    const { data: predictions } = await supabase
        .from('predictions')
        .select(`
            id,
            home_goals_pred,
            away_goals_pred,
            points_earned,
            updated_at,
            matches (
                id,
                kickoff_time,
                status,
                home:home_team_id (name, flag_url),
                away:away_team_id (name, flag_url)
            )
        `)
        .eq('user_id', userId);

    // 5. Filtrar: solo mostrar lo que ya está bloqueado o finalizado
    const visiblePredictions = predictions?.filter((p: any) => {
        const m = p.matches;
        if (!m) return false;
        return m.status === 'finished' || isMatchLocked(m.kickoff_time);
    }).sort((a: any, b: any) => {
        return new Date(b.matches.kickoff_time).getTime() - new Date(a.matches.kickoff_time).getTime();
    }) || [];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdminViewer} displayName={viewerDisplayName} avatarUrl={viewerAvatarUrl} nickname={viewerNickname} />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                <header className="mb-6 max-w-5xl mx-auto">
                    <a href="/leaderboard" className="text-[var(--color-neon-cyan)] hover:underline font-semibold text-sm flex items-center gap-1">
                        &larr; Volver a Clasificación
                    </a>
                </header>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-[var(--color-surface)]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-neon-purple)]/20 filter blur-[80px] rounded-full -mr-20 -mt-20"></div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-cyan)] p-1 shrink-0">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={profileAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.nickname || userId)}`} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    {profileName}
                                    {profile.is_admin && <ShieldCheck size={20} className="text-[var(--color-neon-red)]" />}
                                </h1>
                                <p className="text-gray-400 font-medium">@{profile.nickname || userId.substring(0,8)}</p>
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                        <Trophy size={16} className="text-[var(--color-neon-green)]" />
                                        <span className="text-white font-heading font-bold">{profile.total_points} <span className="text-[10px] text-gray-500 ml-1">PUNTOS</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-heading font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={20} className="text-[var(--color-neon-cyan)]" />
                        Pronósticos Revelados
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visiblePredictions.length > 0 ? visiblePredictions.map((p: any) => (
                            <div key={p.id} className="bg-black/30 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${p.matches.status === 'finished' ? 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)]' : 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)]'}`}>
                                        {p.matches.status === 'finished' ? 'Calificado' : 'Bloqueado'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {formatToColombiaTime(p.matches.kickoff_time)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center gap-2 mb-3">
                                    <div className="flex-1 flex flex-col items-center">
                                        <img src={p.matches.home?.flag_url || ''} className="w-10 h-10 rounded-full mb-1 object-cover border border-white/10" alt="" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase truncate w-full text-center">{p.matches.home?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-heading font-black text-white">{p.home_goals_pred}</span>
                                        <span className="text-gray-600">-</span>
                                        <span className="text-3xl font-heading font-black text-white">{p.away_goals_pred}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                        <img src={p.matches.away?.flag_url || ''} className="w-10 h-10 rounded-full mb-1 object-cover border border-white/10" alt="" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase truncate w-full text-center">{p.matches.away?.name}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Puntos Obtenidos</span>
                                    <span className="text-[var(--color-neon-green)] font-heading font-black">{p.points_earned} PTS</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                                <p className="text-gray-500 italic">No hay pronósticos visibles todavía para este usuario.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
