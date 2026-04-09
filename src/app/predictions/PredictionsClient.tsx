"use client";

import React, { useState, useMemo } from 'react';
import { formatToColombiaTime } from '@/utils/date-helpers';
import { Users, Clock, Trophy, ChevronRight, Eye } from 'lucide-react';

interface Prediction {
    id: number;
    match_id: number;
    home_goals_pred: number;
    away_goals_pred: number;
    points_earned: number;
    updated_at: string;
    profiles: {
        display_name: string;
        nickname: string | null;
        is_admin: boolean;
        avatar_url?: string | null;
    };
}

interface Match {
    id: number;
    kickoff_time: string;
    status: string;
    home: { name: string; flag_url: string | null };
    away: { name: string; flag_url: string | null };
    home_goals_real?: number | null;
    away_goals_real?: number | null;
}

export default function PredictionsClient({ 
    matches, 
    predictions 
}: { 
    matches: Match[]; 
    predictions: Prediction[] 
}) {
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(
        matches.length > 0 ? matches[0].id : null
    );

    const selectedMatch = useMemo(() => 
        matches.find(m => m.id === selectedMatchId), 
    [matches, selectedMatchId]);

    const filteredPredictions = useMemo(() => 
        predictions.filter(p => p.match_id === selectedMatchId),
    [predictions, selectedMatchId]);

    return (
        <div className="flex flex-col gap-8">
            {/* Match Selector */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 px-1">
                    {matches.map((m) => {
                        const isSelected = m.id === selectedMatchId;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMatchId(m.id)}
                                className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                    isSelected
                                        ? 'bg-[var(--color-neon-cyan)]/20 border-[var(--color-neon-cyan)]/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-1 group">
                                    <div className="w-8 h-5 bg-black/40 rounded overflow-hidden border border-white/10">
                                        <img src={m.home.flag_url || ''} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 group-hover:text-white transition-colors">VS</span>
                                    <div className="w-8 h-5 bg-black/40 rounded overflow-hidden border border-white/10">
                                        <img src={m.away.flag_url || ''} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-[var(--color-neon-cyan)]' : 'text-gray-400'}`}>
                                        {m.home.name} v {m.away.name}
                                    </p>
                                    <p className="text-[8px] text-gray-600 font-bold">{formatToColombiaTime(m.kickoff_time).split(' - ')[0]}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            {selectedMatch ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header del Partido Seleccionado */}
                    <div className="bg-[var(--color-surface)]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Eye size={120} />
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex flex-col items-center gap-3 w-32">
                                <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl bg-gray-900">
                                    <img src={selectedMatch.home.flag_url || ''} alt="" className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-heading font-black text-white text-center text-sm uppercase tracking-tight">{selectedMatch.home.name}</h3>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-5xl md:text-7xl font-heading font-black text-white flex items-center gap-4">
                                    {selectedMatch.status === 'finished' ? (
                                        <>
                                            <span>{selectedMatch.home_goals_real}</span>
                                            <span className="text-gray-700">-</span>
                                            <span>{selectedMatch.away_goals_real}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-700 tracking-[0.5em]">VS</span>
                                    )}
                                </div>
                                {selectedMatch.status === 'finished' && (
                                    <span className="mt-2 text-[10px] font-black bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] px-4 py-1 rounded-full uppercase tracking-widest border border-[var(--color-neon-green)]/30">Resultado Final</span>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-3 w-32">
                                <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl bg-gray-900">
                                    <img src={selectedMatch.away.flag_url || ''} alt="" className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-heading font-black text-white text-center text-sm uppercase tracking-tight">{selectedMatch.away.name}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Predicciones */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-heading font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                                <Users className="text-[var(--color-neon-cyan)]" size={20} />
                                Pronósticos de Usuarios
                                <span className="text-[var(--color-neon-cyan)] ml-2 bg-[var(--color-neon-cyan)]/10 px-2 py-0.5 rounded text-xs">{filteredPredictions.length}</span>
                            </h2>
                        </div>

                        {filteredPredictions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPredictions.map((p) => (
                                    <div key={p.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all flex flex-col gap-4 group">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black/40">
                                                    <img 
                                                        src={p.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.profiles.nickname || p.profiles.display_name)}`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm leading-none">{p.profiles.nickname || p.profiles.display_name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-widest">Jugador</p>
                                                </div>
                                            </div>
                                            {selectedMatch.status === 'finished' && (
                                                <div className="text-right">
                                                    <p className="text-[var(--color-neon-green)] font-heading font-black text-lg leading-none">+{p.points_earned}</p>
                                                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Puntos</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center gap-6 py-2 bg-black/30 rounded-xl shadow-inner border border-white/5">
                                            <span className="text-5xl font-heading font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{p.home_goals_pred}</span>
                                            <div className="h-10 w-[2px] bg-white/5"></div>
                                            <span className="text-5xl font-heading font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{p.away_goals_pred}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                                            <Clock size={10} />
                                            Enviado: {formatToColombiaTime(p.updated_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-16 text-center">
                                <Users size={40} className="mx-auto text-gray-700 mb-4 opacity-30" />
                                <p className="text-gray-500 font-medium italic">Nadie ha enviado pronósticos para este partido todavía.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-24 text-center">
                    <Trophy size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                    <p className="text-gray-500 font-medium italic">Selecciona un partido para ver lo que predijeron los demás.</p>
                </div>
            )}
        </div>
    );
}
