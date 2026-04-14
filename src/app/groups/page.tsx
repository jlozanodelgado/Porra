import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';

export default async function GroupsPage() {
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

    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .order('group_name', { ascending: true })
        .order('name', { ascending: true });

    // Cargar partidos finalizados para calcular la tabla
    const { data: matches } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_goals_real, away_goals_real, status, is_playoff')
        .eq('status', 'finished')
        .eq('is_playoff', false);

    // Calcular estadísticas por equipo
    const teamStats: Record<number, any> = {};
    matches?.forEach(m => {
        const hId = m.home_team_id;
        const aId = m.away_team_id;
        if (!hId || !aId) return;

        const hG = m.home_goals_real || 0;
        const aG = m.away_goals_real || 0;

        if (!teamStats[hId]) teamStats[hId] = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
        if (!teamStats[aId]) teamStats[aId] = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };

        teamStats[hId].pj++;
        teamStats[aId].pj++;
        teamStats[hId].gf += hG;
        teamStats[hId].gc += aG;
        teamStats[aId].gf += aG;
        teamStats[aId].gc += hG;

        if (hG > aG) {
            teamStats[hId].g++;
            teamStats[hId].pts += 3;
            teamStats[aId].p++;
        } else if (aG > hG) {
            teamStats[aId].g++;
            teamStats[aId].pts += 3;
            teamStats[hId].p++;
        } else {
            teamStats[hId].e++;
            teamStats[aId].e++;
            teamStats[hId].pts += 1;
            teamStats[aId].pts += 1;
        }
        teamStats[hId].dg = teamStats[hId].gf - teamStats[hId].gc;
        teamStats[aId].dg = teamStats[aId].gf - teamStats[aId].gc;
    });

    // Agrupar y ordenar equipos por group_name con criterios FIFA
    const groups: Record<string, any[]> = {};
    teams?.forEach(t => {
        const gn = t.group_name || 'Sin Grupo';
        if (!groups[gn]) groups[gn] = [];
        
        const stats = teamStats[t.id] || { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
        groups[gn].push({ ...t, ...stats });
    });

    const groupKeys = Object.keys(groups).sort();
    
    // Ordenar cada grupo por PTS > DG > GF > Nombre
    groupKeys.forEach(gk => {
        groups[gk].sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.dg !== a.dg) return b.dg - a.dg;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return a.name.localeCompare(b.name);
        });
    });

    // Calcular Mejores Terceros
    const bestThirds: any[] = [];
    groupKeys.forEach(gk => {
        if (groups[gk].length >= 3) {
            bestThirds.push({ ...groups[gk][2], gk });
        }
    });

    // Ordenar ranking de terceros
    bestThirds.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
    });

    const qualifyingThirdsIds = new Set(bestThirds.slice(0, 8).map(t => t.id));

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} avatarUrl={avatarUrl} nickname={nickname} />
            <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] text-xs font-bold uppercase tracking-widest mb-4">
                        <LayoutGrid size={14} />
                        Fase de Grupos
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Resultados del Torneo</h1>
                    <p className="text-gray-400 mt-2">Seguimiento oficial de los 12 grupos del Mundial 2026.</p>
                </header>

                <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {groupKeys.map((gk) => (
                        <div key={gk} className="bg-[var(--color-surface)]/20 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-[var(--color-neon-cyan)]/30 group">
                            <div className="bg-gradient-to-r from-[var(--color-surface)] to-transparent border-b border-white/10 py-4 px-6 flex justify-between items-center">
                                <h2 className="text-[var(--color-neon-cyan)] font-heading font-black text-2xl uppercase italic tracking-tighter drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">Grupo {gk}</h2>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Standing Oficial</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-body text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                                            <th className="py-3 px-4">Equipo</th>
                                            <th className="py-3 px-2 text-center">PJ</th>
                                            <th className="py-3 px-1 text-center hidden md:table-cell">G</th>
                                            <th className="py-3 px-1 text-center hidden md:table-cell">E</th>
                                            <th className="py-3 px-1 text-center hidden md:table-cell">P</th>
                                            <th className="py-3 px-2 text-center hidden md:table-cell">GF:GC</th>
                                            <th className="py-3 px-2 text-center italic">DG</th>
                                            <th className="py-3 px-4 text-center text-[var(--color-neon-cyan)]">PTS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {groups[gk].map((t, index) => {
                                            const isQualifyingThird = index === 2 && qualifyingThirdsIds.has(t.id);
                                            const isTopTwo = index < 2;

                                            return (
                                                <tr key={t.id} className={`transition-colors hover:bg-white/5 
                                                    ${isTopTwo ? 'bg-[var(--color-neon-green)]/5' : ''}
                                                    ${isQualifyingThird ? 'bg-[var(--color-neon-cyan)]/10' : ''}
                                                `}>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[10px] font-bold w-4 
                                                                ${isTopTwo ? 'text-[var(--color-neon-green)]' : isQualifyingThird ? 'text-[var(--color-neon-cyan)] text-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-gray-500'}
                                                            `}>
                                                                {index + 1}
                                                            </span>
                                                        <div className="w-8 h-5 rounded-sm overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                                                            {t.flag_url && <img src={t.flag_url} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                        <span className="text-white font-bold truncate max-w-[120px]">{t.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-center text-gray-400 font-bold">{t.pj}</td>
                                                <td className="py-4 px-1 text-center text-gray-500 hidden md:table-cell">{t.g}</td>
                                                <td className="py-4 px-1 text-center text-gray-500 hidden md:table-cell">{t.e}</td>
                                                <td className="py-4 px-1 text-center text-gray-500 hidden md:table-cell">{t.p}</td>
                                                <td className="py-4 px-2 text-center text-gray-500 hidden md:table-cell whitespace-nowrap">
                                                    {t.gf}:{t.gc}
                                                </td>
                                                <td className={`py-4 px-2 text-center italic font-bold ${t.dg > 0 ? 'text-[var(--color-neon-green)]' : t.dg < 0 ? 'text-[var(--color-neon-red)]' : 'text-gray-400'}`}>
                                                    {t.dg > 0 ? `+${t.dg}` : t.dg}
                                                </td>
                                                    <td className="py-4 px-4 text-center font-heading font-black text-sm text-[var(--color-neon-cyan)] drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">
                                                        {t.pts}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-black/20 text-[9px] text-gray-600 flex justify-between items-center italic border-t border-white/5">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded bg-[var(--color-neon-green)] shadow-[0_0_5px_rgba(57,255,20,0.5)]"></div>
                                        <span>Clasifica (Top 2)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded bg-[var(--color-neon-cyan)] shadow-[0_0_5px_rgba(0,255,255,0.5)]"></div>
                                        <span>Mejor 3ero (Clasifica)</span>
                                    </div>
                                </div>
                                <span className="hidden md:block opacity-50">* Basado en formato 2026</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sección de Mejores Terceros */}
                <div className="max-w-7xl mx-auto mt-16 mb-20">
                    <header className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] text-xs font-bold uppercase tracking-widest mb-4">
                            Ranking de Terceros
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-white uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.2)]">Mejores Terceros Clasificados</h2>
                        <p className="text-gray-400 mt-2 text-sm italic">Los 8 mejores equipos que ocupen la 3ª posición avanzan a la Ronda de 32.</p>
                    </header>

                    <div className="bg-[var(--color-surface)]/20 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-[var(--color-neon-cyan)]/30">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-body text-xs border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                                        <th className="py-3 px-4">#</th>
                                        <th className="py-3 px-4">Equipo</th>
                                        <th className="py-3 px-2 text-center">Gr.</th>
                                        <th className="py-3 px-2 text-center">PJ</th>
                                        <th className="py-3 px-2 text-center italic">DG</th>
                                        <th className="py-3 px-4 text-center text-[var(--color-neon-cyan)]">PTS</th>
                                        <th className="py-3 px-4 text-center">Estatus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bestThirds.map((t, index) => {
                                        const isQualifying = index < 8;
                                        return (
                                            <tr key={t.id} className={`transition-colors hover:bg-white/5 ${isQualifying ? 'bg-[var(--color-neon-cyan)]/5' : ''}`}>
                                                <td className="py-4 px-4 font-bold text-gray-500">{index + 1}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-5 rounded-sm overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                                                            {t.flag_url && <img src={t.flag_url} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                        <span className="text-white font-bold">{t.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-center text-gray-400 font-bold">{t.gk}</td>
                                                <td className="py-4 px-2 text-center text-gray-400">{t.pj}</td>
                                                <td className={`py-4 px-2 text-center italic font-bold ${t.dg > 0 ? 'text-[var(--color-neon-green)]' : t.dg < 0 ? 'text-[var(--color-neon-red)]' : 'text-gray-400'}`}>
                                                    {t.dg > 0 ? `+${t.dg}` : t.dg}
                                                </td>
                                                <td className="py-4 px-4 text-center font-heading font-black text-sm text-[var(--color-neon-cyan)]">
                                                    {t.pts}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {isQualifying ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] text-[8px] font-black uppercase tracking-tighter border border-[var(--color-neon-green)]/20 animate-pulse">
                                                            Clasificado
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-tighter border border-red-500/20">
                                                            Eliminado
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
