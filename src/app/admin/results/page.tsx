import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminResultForm from '@/components/admin/AdminResultForm';

export default async function AdminResultsPage() {
    const supabase = await createClient();

    const { data: matchesData } = await supabase
        .from('matches')
        .select(`
            *,
            home:home_team_id (name),
            away:away_team_id (name)
        `)
        .order('kickoff_time', { ascending: true });

    const matches = matchesData || [];

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">
                    Carga de <span className="text-[var(--color-neon-cyan)] drop-shadow-[0_0_8px_var(--color-neon-cyan)]">RESULTADOS</span>
                </h1>
                <p className="text-gray-400 font-body mt-2">Ingresar marcadores finales para calcular puntos</p>
            </header>

            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-cyan)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-neon-cyan)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_6px_var(--color-neon-cyan)]"></span>
                    Resultados Finales
                </h2>
                <AdminResultForm matches={(matches as any) ?? []} />
            </div>
        </div>
    );
}
