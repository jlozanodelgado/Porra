"use client";

import React, { useState, useMemo } from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { formatToLongDate, getColombiaISODate } from '@/utils/date-helpers';
import { Trophy, Clock, Search, Calendar, ChevronRight } from 'lucide-react';

interface Prediction {
    match_id: number;
    home_goals_pred: number;
    away_goals_pred: number;
}

interface Match {
    id: number;
    home_team_id: number | null;
    away_team_id: number | null;
    kickoff_time: string;
    is_playoff: boolean | null;
    status: string | null;
    home_goals_real: number | null;
    away_goals_real: number | null;
    home?: { name: string; flag_url: string | null } | null;
    away?: { name: string; flag_url: string | null } | null;
}

export default function DashboardClient({ 
    matches, 
    userPredictions,
    displayName
}: { 
    matches: Match[]; 
    userPredictions: Prediction[];
    displayName: string;
}) {
    const [activeTab, setActiveTab] = useState<'pending' | 'finished'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar por texto
    const filteredBySearch = useMemo(() => {
        if (!searchTerm) return matches;
        const lowerSearch = searchTerm.toLowerCase();
        return matches.filter(m => 
            m.home?.name?.toLowerCase().includes(lowerSearch) || 
            m.away?.name?.toLowerCase().includes(lowerSearch)
        );
    }, [matches, searchTerm]);

    // Separar Pendientes vs Finalizados
    const pendingMatches = useMemo(() => 
        filteredBySearch.filter(m => m.status !== 'finished')
        .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime()),
    [filteredBySearch]);

    const finishedMatches = useMemo(() => 
        filteredBySearch.filter(m => m.status === 'finished')
        .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime()), // Más recientes primero
    [filteredBySearch]);

    // Agrupar Pendientes por Fecha
    const groupedPending = useMemo(() => {
        const groups: { [key: string]: Match[] } = {};
        pendingMatches.forEach(m => {
            const dateKey = getColombiaISODate(m.kickoff_time);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(m);
        });
        return groups;
    }, [pendingMatches]);

    const sortedDateKeys = Object.keys(groupedPending).sort();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Buscador y Tabs */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                <div className="flex bg-black/30 p-1 rounded-2xl border border-white/5 backdrop-blur-sm w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'pending'
                                ? 'bg-[var(--color-neon-cyan)] text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <Clock size={16} />
                        Próximos Juegos
                    </button>
                    <button
                        onClick={() => setActiveTab('finished')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'finished'
                                ? 'bg-[var(--color-neon-green)] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <Trophy size={16} />
                        Resultados
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar selección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-neon-cyan)] transition-all"
                    />
                </div>
            </div>

            {/* Listado de Partidos */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === 'pending' ? (
                    <div className="space-y-12">
                        {sortedDateKeys.length > 0 ? sortedDateKeys.map(dateKey => (
                            <div key={dateKey} className="space-y-6">
                                <h3 className="flex items-center gap-3 text-lg font-heading font-black text-white px-2">
                                    <Calendar className="text-[var(--color-neon-cyan)]" size={20} />
                                    <span className="uppercase tracking-tighter">{formatToLongDate(groupedPending[dateKey][0].kickoff_time)}</span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {groupedPending[dateKey].map((m) => {
                                        const prediction = userPredictions?.find(p => p.match_id === m.id);
                                        return (
                                            <a key={m.id} href={`/match/${m.id}`} className="block group">
                                                <MatchCard
                                                    id={m.id}
                                                    homeTeam={m.home?.name || 'Local'}
                                                    awayTeam={m.away?.name || 'Visitante'}
                                                    homeFlag={m.home?.flag_url || ''}
                                                    awayFlag={m.away?.flag_url || ''}
                                                    kickoffTime={m.kickoff_time}
                                                    status={m.status ?? 'pending'}
                                                    homeGoalsReal={m.home_goals_real}
                                                    awayGoalsReal={m.away_goals_real}
                                                    prediction={prediction ? {
                                                        homeGoals: prediction.home_goals_pred,
                                                        awayGoals: prediction.away_goals_pred
                                                    } : undefined}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )) : (
                            <EmptyState message="No hay partidos próximos programados." />
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {finishedMatches.length > 0 ? finishedMatches.map((m) => {
                            const prediction = userPredictions?.find(p => p.match_id === m.id);
                            return (
                                <a key={m.id} href={`/match/${m.id}`} className="block">
                                    <MatchCard
                                        id={m.id}
                                        homeTeam={m.home?.name || 'Local'}
                                        awayTeam={m.away?.name || 'Visitante'}
                                        homeFlag={m.home?.flag_url || ''}
                                        awayFlag={m.away?.flag_url || ''}
                                        kickoffTime={m.kickoff_time}
                                        status={m.status ?? 'pending'}
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
                            <EmptyState message="Aún no se han jugado partidos." />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full text-center text-gray-500 italic py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
            <Search size={48} className="opacity-20 capitalize" />
            <p>{message}</p>
        </div>
    );
}
