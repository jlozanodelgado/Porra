import React from 'react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // 1 minute cache via nextjs 

const PAGE_SIZE = 15;

export default async function LeaderboardPage(props: {
    searchParams: Promise<{ page?: string; porra_id?: string }>
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page || '1');
    const porraId = searchParams.porra_id || null;
    const currentPage = isNaN(page) || page < 1 ? 1 : page;
    const offset = (currentPage - 1) * PAGE_SIZE;

    const supabase = await createClient();

    // Obtener perfil del usuario actual para saber su porra_id
    const { data: { user } } = await supabase.auth.getUser();
    let userPorraId = porraId;

    if (!userPorraId && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('porra_id')
            .eq('id', user.id)
            .single();
        userPorraId = profile?.porra_id || null;
    }

    // Construir query con filtro de porra
    let query = supabase
        .from('profiles')
        .select('id, display_name, nickname, avatar_url, total_points, is_paid, porra_id', { count: 'exact' })
        .eq('is_admin', false);

    if (userPorraId) {
        query = query.eq('porra_id', userPorraId);
    } else {
        query = query.is('porra_id', null);
    }

    const { data: users, error, count } = await query
        .order('total_points', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
        console.error('Error fetching leaderboard:', error);
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // 2. Calcular puestos manejando empates globalmente
    // Para que el rank sea correcto en páginas avanzadas, consultamos cuántos tienen puntaje estrictamente mayor al primero de la lista
    let usersWithRank: any[] = [];
    if (users && users.length > 0) {
        const userList = users!;
        let usersAboveQuery = supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false)
            .gt('total_points', userList[0].total_points);

        if (userPorraId) {
            usersAboveQuery = usersAboveQuery.eq('porra_id', userPorraId);
        } else {
            usersAboveQuery = usersAboveQuery.is('porra_id', null);
        }

        const { count: usersAbove } = await usersAboveQuery;

        let currentRank = (usersAbove || 0) + 1;
        
        usersWithRank = userList.map((u: any, i: number) => {
            if (i > 0 && u.total_points < userList[i - 1].total_points) {
                // Si el puntaje es menor al anterior, su puesto es su posición absoluta
                currentRank = offset + i + 1;
            }
            // Si el puntaje es igual al anterior, mantiene el currentRank (ya inicializado para el primero)
            return { ...u, rank: currentRank };
        });
    }

    const isFirstPage = currentPage === 1;

    return (
        <main className="min-h-screen bg-[var(--color-background)] p-6 flex flex-col items-center">
            <header className="mb-6 w-full max-w-4xl flex justify-between items-center">
                <a href="/dashboard" className="text-[var(--color-neon-cyan)] hover:underline font-semibold flex items-center gap-1">
                    &larr; Volver
                </a>
            </header>

            <header className="mb-10 text-center">
                {isFirstPage ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-neon-cyan)] via-[var(--color-neon-purple)] to-[var(--color-neon-red)] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] uppercase tracking-tighter scale-110 mb-2">
                           🏆 TOP 15 LOS MEJORES 🏆
                        </h1>
                        <p className="text-[var(--color-neon-green)] font-body font-bold animate-pulse text-sm uppercase tracking-widest">Élite del Pronóstico</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-red)] drop-shadow-[0_0_10px_rgba(176,38,255,0.5)] uppercase tracking-tight">
                            Tabla de Posiciones
                        </h1>
                        <p className="text-gray-400 font-body mt-2">Página {currentPage} de {totalPages}</p>
                    </>
                )}
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
                            <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/5 group">
                                <td className="py-4 pl-4 font-heading font-bold text-gray-400 text-xl">
                                    {u.rank <= 3 && isFirstPage ? (
                                        <span className={`
                                            ${u.rank === 1 ? 'text-[var(--color-neon-green)] text-3xl' : ''}
                                            ${u.rank === 2 ? 'text-[var(--color-neon-cyan)] text-2xl' : ''}
                                            ${u.rank === 3 ? 'text-[var(--color-neon-purple)] text-2xl' : ''}
                                            drop-shadow-[0_0_8px_currentColor]
                                        `}>
                                            {u.rank}
                                        </span>
                                    ) : (
                                        u.rank
                                    )}
                                </td>
                                <td className="py-4 font-semibold text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:border-[var(--color-neon-cyan)]/50 transition-all">
                                            <img 
                                                src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.nickname || u.id)}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <a href={`/leaderboard/${u.id}`} className="hover:text-[var(--color-neon-cyan)] transition-colors text-lg">
                                                {u.nickname || u.display_name}
                                            </a>
                                            {!u.is_paid && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">⛔ Inactivo (Sin Pago)</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-right pr-4 font-heading font-bold text-gray-300 text-2xl">
                                    <div className="flex items-center justify-end gap-4">
                                        <span className="tabular-nums">{u.total_points}</span>
                                        <a 
                                            href={`/leaderboard/${u.id}`}
                                            className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                                        >
                                            Ver Perfil
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">No hay usuarios registrados aún.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 relative z-10">
                        <div className="text-sm text-gray-500 font-body">
                            Mostrando <span className="text-white font-bold">{offset + 1}</span> - <span className="text-white font-bold">{Math.min(offset + PAGE_SIZE, totalCount)}</span> de <span className="text-white font-bold">{totalCount}</span> usuarios
                        </div>
                        <div className="flex gap-2">
                            {currentPage > 1 && (
                                <a 
                                    href={`/leaderboard?page=${currentPage - 1}`}
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 hover:border-[var(--color-neon-cyan)] transition-all flex items-center gap-2"
                                >
                                    &larr; Anterior
                                </a>
                            )}
                            {currentPage < totalPages && (
                                <a 
                                    href={`/leaderboard?page=${currentPage + 1}`}
                                    className="px-4 py-2 rounded-lg bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 text-sm font-bold text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/20 hover:border-[var(--color-neon-cyan)] transition-all flex items-center gap-2"
                                >
                                    Siguiente &rarr;
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

