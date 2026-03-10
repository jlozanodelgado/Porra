import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClipboardList, Clock } from 'lucide-react';
import { formatToColombiaTime } from '@/utils/date-helpers';
import Sidebar from '@/components/layout/Sidebar';

export default async function PredictionsPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.display_name || 'Usuario';

    // Cargar predicciones públicas (solo si el partido empezó o faltan <15 min)
    // El RLS ya se encarga de filtrar esto, así que podemos pedir todo.
    const { data: predictions } = await supabase
        .from('predictions')
        .select(`
            *,
            profiles(display_name),
            matches(
                kickoff_time,
                home:home_team_id(name),
                away:away_team_id(name)
            )
        `)
        .order('updated_at', { ascending: false });

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} />
            <main className="flex-1 overflow-y-auto p-6">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] text-xs font-bold uppercase tracking-widest mb-4">
                        <ClipboardList size={14} />
                        Hoja de Predicciones
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white uppercase">Transparencia Total</h1>
                    <p className="text-gray-400 mt-2">Aquí puedes ver los pronósticos de todos los jugadores una vez bloqueado el partido.</p>
                </header>

                <div className="max-w-5xl mx-auto">
                    {predictions && predictions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {predictions.map((p: any) => (
                                <div key={p.id} className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Jugador</p>
                                            <p className="text-white font-bold">{p.profiles?.display_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[var(--color-neon-green)] font-heading font-black text-xl">
                                                {p.points_earned} <span className="text-[10px] text-gray-500">PTS</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between mb-3">
                                        <span className="text-gray-300 text-sm font-semibold truncate flex-1">{p.matches?.home?.name}</span>
                                        <div className="flex items-center gap-2 px-4 shadow-inner">
                                            <span className="text-2xl font-heading font-black text-white">{p.home_goals_pred}</span>
                                            <span className="text-gray-600">-</span>
                                            <span className="text-2xl font-heading font-black text-white">{p.away_goals_pred}</span>
                                        </div>
                                        <span className="text-gray-300 text-sm font-semibold truncate flex-1 text-right">{p.matches?.away?.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                        <Clock size={12} />
                                        <span>Actualizado: {formatToColombiaTime(p.updated_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--color-surface)]/20 border border-dashed border-white/10 rounded-2xl p-20 text-center">
                            <ClipboardList size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
                            <p className="text-gray-500 italic">No hay predicciones visibles todavía. Recuerda que solo aparecen cuando faltan 15 minutos para el pitazo inicial.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
