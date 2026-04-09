import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminPredictionTable from '@/components/admin/AdminPredictionTable';

export default async function AdminPredictionsPage() {
    const supabase = await createClient();

    // Cargar predicciones Consolidadas (Solo de partidos bloqueados o finalizados)
    const nowUtc = new Date();
    const cutoffTime = new Date(nowUtc.getTime() + 15 * 60 * 1000).toISOString();

    const { data: allPredictions } = await supabase
        .from('predictions')
        .select(`
            id,
            home_goals_pred,
            away_goals_pred,
            points_earned,
            user_id,
            profiles(display_name, nickname, avatar_url),
            matches!inner(
                id,
                kickoff_time,
                status,
                home:home_team_id(name),
                away:away_team_id(name)
            )
        `)
        .or(`status.eq.finished,kickoff_time.lte.${cutoffTime}`, { foreignTable: 'matches' })
        .order('updated_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">
                    Reporte de <span className="text-[var(--color-neon-green)] drop-shadow-[0_0_8px_var(--color-neon-green)]">TRANSPARENCIA</span>
                </h1>
                <p className="text-gray-400 font-body mt-2">Consolidado de predicciones bloqueadas y finalizadas</p>
            </header>

            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-green)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-neon-green)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-neon-green)] shadow-[0_0_6px_var(--color-neon-green)]"></span>
                    Predicciones Consolidadas
                </h2>
                <p className="text-xs text-gray-500 mb-6">Muestra todos los pronósticos una vez el partido está bloqueado (15 min antes) o finalizado.</p>
                <AdminPredictionTable predictions={(allPredictions as any) || []} />
            </div>
        </div>
    );
}
