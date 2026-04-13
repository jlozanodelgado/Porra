import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import PredictionsClient from './PredictionsClient';

export default async function PredictionsPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name, nickname, avatar_url')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.nickname || profile?.display_name || 'Usuario';
    const avatarUrl = profile?.avatar_url;
    const nickname = profile?.nickname || '';

    // 1. Obtener todos los partidos que ya están bloqueados o finalizados
    const nowUtc = new Date();
    const cutoffTime = new Date(nowUtc.getTime() + 15 * 60 * 1000).toISOString();

    const { data: matches } = await supabase
        .from('matches')
        .select(`
            id, kickoff_time, status, home_goals_real, away_goals_real,
            home:home_team_id(name, flag_url),
            away:away_team_id(name, flag_url)
        `)
        .or(`status.eq.finished,kickoff_time.lte.${cutoffTime}`)
        .order('kickoff_time', { ascending: false });

    // 2. Obtener todas las predicciones para esos partidos (solo de usuarios no-admin)
    const matchIds = matches?.map(m => m.id) || [];
    
    let predictions: any[] = [];
    
    if (matchIds.length > 0) {
        const { data } = await supabase
            .from('predictions')
            .select(`
                *,
                profiles!inner(display_name, nickname, is_admin, avatar_url)
            `)
            .in('match_id', matchIds)
            .eq('profiles.is_admin', false)
            .order('updated_at', { ascending: false });
            
        predictions = data || [];
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} avatarUrl={avatarUrl} nickname={nickname} />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative scrollbar-hide">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] text-xs font-bold uppercase tracking-widest mb-4">
                        <ClipboardList size={14} />
                        Transparencia Total
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter">Predicciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)]">Globales</span></h1>
                    <p className="text-gray-400 mt-2 font-medium">Selecciona un partido para revisar qué pronosticó cada jugador.</p>
                </header>

                <div className="max-w-6xl mx-auto">
                    <PredictionsClient 
                        matches={(matches as any) || []} 
                        predictions={(predictions as any) || []} 
                    />
                </div>
            </main>
        </div>
    );
}
