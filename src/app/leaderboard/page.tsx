import React from 'react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // 1 minute cache via nextjs 

export default async function LeaderboardPage() {
    const supabase = await createClient();
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, display_name, nickname, avatar_url, total_points, is_paid')
        .eq('is_admin', false)
        .order('total_points', { ascending: false });

    if (error) {
        console.error('Error fetching leaderboard:', error);
    }

    // Calcular puestos manejando empates
    let currentRank = 1;
    const usersWithRank = users ? users.map((u: any, i: number) => {
        if (i > 0 && u.total_points < users[i - 1].total_points) {
            currentRank = i + 1;
        }
        return { ...u, rank: currentRank };
    }) : [];

    return (
        <main className="min-h-screen bg-[var(--color-background)] p-6 flex flex-col items-center">
            <header className="mb-6 w-full max-w-4xl flex justify-between items-center">
                <a href="/dashboard" className="text-[var(--color-neon-cyan)] hover:underline font-semibold flex items-center gap-1">
                    &larr; Volver
                </a>
            </header>

            <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-red)] drop-shadow-[0_0_10px_rgba(176,38,255,0.5)] uppercase tracking-tight">
                    Tabla de Posiciones
                </h1>
                <p className="text-gray-400 font-body mt-2">Los mejores pronosticadores del torneo</p>
            </header>

            <div className="w-full max-w-4xl bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                {/* Decorative ambient light */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-neon-purple)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--color-neon-red)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

                <table className="w-full text-left font-body relative z-10">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="pb-4 pl-4 font-semibold uppercase">Pos</th>
                            <th className="pb-4 font-semibold uppercase">Participante</th>
                            <th className="pb-4 text-right pr-4 font-semibold uppercase">Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersWithRank.length > 0 ? usersWithRank.map((u: any) => (
                            <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                                <td className="py-4 pl-4 font-heading font-bold text-gray-400 text-xl">
                                    {u.rank === 1 ? <span className="text-[var(--color-neon-green)] shadow-lg">{u.rank}</span> : u.rank}
                                </td>
                                <td className="py-4 font-semibold text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                            <img 
                                                src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.nickname || u.id)}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <a href={`/leaderboard/${u.id}`} className="hover:text-[var(--color-neon-cyan)] transition-colors">
                                            {u.nickname || u.display_name}
                                        </a>
                                        {!u.is_paid && <span className="text-xs ml-2 text-gray-600">(Inactivo)</span>}
                                    </div>
                                </td>
                                <td className="py-4 text-right pr-4 font-heading font-bold text-gray-300 text-xl">
                                    <div className="flex items-center justify-end gap-4">
                                        <span>{u.total_points}</span>
                                        <a 
                                            href={`/leaderboard/${u.id}`}
                                            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/10 transition-all"
                                        >
                                            Ver
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">No hay usuarios registrados aún.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
