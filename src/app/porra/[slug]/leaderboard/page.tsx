import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

const PAGE_SIZE = 15;

interface PorraLeaderboardPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function PorraLeaderboardPage({ params, searchParams }: PorraLeaderboardPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || '1');
    const currentPage = isNaN(page) || page < 1 ? 1 : page;
    const offset = (currentPage - 1) * PAGE_SIZE;

    const supabase = await createClient();

    // Obtener datos de la porra
    const { data: porra } = await supabase
        .from('porras')
        .select('id, name, primary_color, secondary_color')
        .eq('slug', slug)
        .single();

    if (!porra) {
        return (
            <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-heading font-bold text-white mb-4">Porra no encontrada</h1>
                    <Link href="/" className="text-[var(--color-neon-cyan)] hover:underline">Volver al inicio</Link>
                </div>
            </main>
        );
    }

    const primaryColor = porra.primary_color || '#00ff00';
    const secondaryColor = porra.secondary_color || '#00ffff';

    // Obtener usuarios de esta porra
    const { data: users, count } = await supabase
        .from('profiles')
        .select('id, display_name, nickname, avatar_url, total_points, is_paid', { count: 'exact' })
        .eq('is_admin', false)
        .eq('porra_id', porra.id)
        .order('total_points', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Calcular ranks
    let usersWithRank: any[] = [];
    if (users && users.length > 0) {
        const { count: usersAbove } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false)
            .eq('porra_id', porra.id)
            .gt('total_points', users[0].total_points);

        let currentRank = (usersAbove || 0) + 1;

        usersWithRank = users.map((u: any, i: number) => {
            if (i > 0 && (u.total_points ?? 0) < (users[i - 1].total_points ?? 0)) {
                currentRank = offset + i + 1;
            }
            return { ...u, rank: currentRank };
        });
    }

    const isFirstPage = currentPage === 1;

    return (
        <main
            className="min-h-screen bg-[var(--color-background)] p-6 flex flex-col items-center"
            style={{ '--porra-primary': primaryColor, '--porra-secondary': secondaryColor } as React.CSSProperties}
        >
            <header className="mb-6 w-full max-w-4xl flex justify-between items-center">
                <Link href={`/porra/${slug}/dashboard`} className="text-[var(--porra-primary)] hover:underline font-semibold flex items-center gap-1">
                    &larr; Volver
                </Link>
                <span
                    className="text-xs uppercase tracking-widest font-black px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                    {porra.name}
                </span>
            </header>

            <header className="mb-10 text-center">
                {isFirstPage ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--porra-primary)] to-[var(--porra-secondary)] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] uppercase tracking-tighter scale-110 mb-2">
                            🏆 TOP 15 🏆
                        </h1>
                        <p className="font-body font-bold animate-pulse text-sm uppercase tracking-widest" style={{ color: primaryColor }}>Élite del Pronóstico</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--porra-secondary)] to-[var(--porra-primary)] uppercase tracking-tight">
                            Tabla de Posiciones
                        </h1>
                        <p className="text-gray-400 font-body mt-2">Página {currentPage} de {totalPages}</p>
                    </>
                )}
            </header>

            <div className="w-full max-w-4xl bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: primaryColor }}
                />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: secondaryColor }}
                />

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
                                        <span
                                            className="drop-shadow-[0_0_8px_currentColor]"
                                            style={{
                                                color: u.rank === 1 ? primaryColor : u.rank === 2 ? secondaryColor : '#a855f7',
                                                fontSize: u.rank === 1 ? '1.875rem' : '1.5rem'
                                            }}
                                        >
                                            {u.rank}
                                        </span>
                                    ) : (
                                        u.rank
                                    )}
                                </td>
                                <td className="py-4 font-semibold text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:border-[var(--porra-primary)]/50 transition-all">
                                            <img
                                                src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.nickname || u.id)}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg">{u.nickname || u.display_name}</span>
                                            {!u.is_paid && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">⛔ Inactivo</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-right pr-4 font-heading font-bold text-gray-300 text-2xl">
                                    <span className="tabular-nums">{u.total_points}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">No hay usuarios registrados aún.</td></tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 relative z-10">
                        <div className="text-sm text-gray-500 font-body">
                            Mostrando <span className="text-white font-bold">{offset + 1}</span> - <span className="text-white font-bold">{Math.min(offset + PAGE_SIZE, totalCount)}</span> de <span className="text-white font-bold">{totalCount}</span> usuarios
                        </div>
                        <div className="flex gap-2">
                            {currentPage > 1 && (
                                <Link
                                    href={`/porra/${slug}/leaderboard?page=${currentPage - 1}`}
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 hover:border-[var(--porra-primary)] transition-all flex items-center gap-2"
                                >
                                    &larr; Anterior
                                </Link>
                            )}
                            {currentPage < totalPages && (
                                <Link
                                    href={`/porra/${slug}/leaderboard?page=${currentPage + 1}`}
                                    className="px-4 py-2 rounded-lg border text-sm font-bold transition-all flex items-center gap-2"
                                    style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}50`, color: primaryColor }}
                                >
                                    Siguiente &rarr;
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}