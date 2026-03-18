"use client";

import React, { useState } from 'react';
import { formatToColombiaTime } from '@/utils/date-helpers';
import { Search, Download, Filter } from 'lucide-react';

interface Prediction {
    id: number;
    home_goals_pred: number;
    away_goals_pred: number;
    points_earned: number;
    user_id: string;
    profiles: {
        display_name: string;
        nickname: string| null;
        avatar_url: string | null;
    };
    matches: {
        id: number;
        kickoff_time: string;
        home: { name: string };
        away: { name: string };
    };
}

export default function AdminPredictionTable({ predictions }: { predictions: Prediction[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [matchFilter, setMatchFilter] = useState('');

    const filteredPredictions = predictions.filter(p => {
        const matchesSearch = 
            p.profiles.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.profiles.nickname && p.profiles.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchName = `${p.matches.home.name} vs ${p.matches.away.name}`.toLowerCase();
        const matchesFilter = matchFilter === '' || matchName.includes(matchFilter.toLowerCase());
        return matchesSearch && matchesFilter;
    }).sort((a, b) => b.points_earned - a.points_earned);

    const uniqueMatches = Array.from(new Set(predictions.map(p => `${p.matches.home.name} vs ${p.matches.away.name}`)));

    const exportToCSV = () => {
        const headers = ["Jugador", "Partido", "Fecha", "Pred. Local", "Pred. Visita", "Pts Ganados"];
        const rows = filteredPredictions.map(p => [
            p.profiles.display_name,
            `${p.matches.home.name} vs ${p.matches.away.name}`,
            new Date(p.matches.kickoff_time).toLocaleString(),
            p.home_goals_pred,
            p.away_goals_pred,
            p.points_earned
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "pronosticos_consolidados.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar jugador..." 
                        className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-neon-cyan)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="flex-1 md:w-48 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-neon-purple)]"
                        value={matchFilter}
                        onChange={(e) => setMatchFilter(e.target.value)}
                    >
                        <option value="">Todos los partidos</option>
                        {uniqueMatches.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] border border-[var(--color-neon-green)]/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-neon-green)]/20 transition-all"
                    >
                        <Download size={16} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-gray-400 uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-4 py-3">Jugador</th>
                            <th className="px-4 py-3">Partido / Fecha</th>
                            <th className="px-4 py-3 text-center">Predicción</th>
                            <th className="px-4 py-3 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                        {filteredPredictions.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                                            <img 
                                                src={p.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.profiles.nickname || p.user_id)}`} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="font-bold text-white truncate">{p.profiles.nickname || p.profiles.display_name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-200">{p.matches.home.name} vs {p.matches.away.name}</div>
                                    <div className="text-[10px] text-gray-500">{formatToColombiaTime(p.matches.kickoff_time)}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-8 h-8 rounded bg-black/40 flex items-center justify-center font-heading font-black text-sm text-[var(--color-neon-cyan)]">{p.home_goals_pred}</span>
                                        <span className="text-gray-600">-</span>
                                        <span className="w-8 h-8 rounded bg-black/40 flex items-center justify-center font-heading font-black text-sm text-[var(--color-neon-cyan)]">{p.away_goals_pred}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-heading font-black text-[var(--color-neon-green)]">+{p.points_earned}</span>
                                </td>
                            </tr>
                        ))}
                        {filteredPredictions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-gray-500 italic">No se encontraron predicciones con los filtros aplicados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
