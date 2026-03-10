"use client";

import React, { useState, useTransition } from 'react';
import { updateMatchResult } from '@/app/actions';

interface Match {
    id: number;
    home_team_id: number | null;
    away_team_id: number | null;
    kickoff_time: string;
    is_playoff: boolean;
    status: string;
    home_goals_real: number | null;
    away_goals_real: number | null;
    home?: { name: string } | null;
    away?: { name: string } | null;
}

export default function AdminResultForm({ matches }: { matches: Match[] }) {
    const [feedback, setFeedback] = useState<Record<number, string>>({});
    const [isPending, startTransition] = useTransition();

    const pendingMatches = matches.filter(m => m.status === 'pending');
    const finishedMatches = matches.filter(m => m.status === 'finished');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, matchId: number) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                const result = await updateMatchResult(formData);
                if (result?.error) {
                    setFeedback(prev => ({ ...prev, [matchId]: result.error! }));
                }
            } catch {
                // redirect throws, this is expected behavior
            }
        });
    };

    return (
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Partidos Pendientes</h3>
            {pendingMatches.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">Todos los partidos tienen resultado.</p>
            ) : (
                <div className="flex flex-col gap-3 mb-6">
                    {pendingMatches.map((m) => (
                        <form
                            key={m.id}
                            onSubmit={(e) => handleSubmit(e, m.id)}
                            className="bg-black/30 rounded-lg p-4 border border-white/5"
                        >
                            <input type="hidden" name="matchId" value={m.id} />
                            <p className="font-semibold text-white text-sm mb-3">
                                {m.home?.name || 'Local'} vs {m.away?.name || 'Visitante'}
                                <span className="text-gray-400 text-xs ml-2">
                                    ({m.is_playoff ? 'Playoff' : 'Grupo'})
                                </span>
                            </p>
                            <div className="flex gap-4 items-center mb-3">
                                <div className="flex flex-col items-center">
                                    <label className="text-xs text-gray-400 mb-1">{m.home?.name || 'L'}</label>
                                    <input
                                        type="number"
                                        name="homeGoalsReal"
                                        min={0}
                                        max={20}
                                        required
                                        placeholder="0"
                                        className="w-16 bg-[var(--color-surface)] border border-white/20 p-2 rounded text-center text-white text-lg font-heading focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                    />
                                </div>
                                <span className="text-white font-bold text-xl mt-4">-</span>
                                <div className="flex flex-col items-center">
                                    <label className="text-xs text-gray-400 mb-1">{m.away?.name || 'V'}</label>
                                    <input
                                        type="number"
                                        name="awayGoalsReal"
                                        min={0}
                                        max={20}
                                        required
                                        placeholder="0"
                                        className="w-16 bg-[var(--color-surface)] border border-white/20 p-2 rounded text-center text-white text-lg font-heading focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            {feedback[m.id] && (
                                <p className="text-xs text-[var(--color-neon-red)] mb-2">{feedback[m.id]}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-[var(--color-neon-cyan)] text-black px-4 py-2 font-bold rounded hover:brightness-110 shadow-lg transition-all disabled:opacity-50 text-sm"
                            >
                                {isPending ? 'Calculando puntos...' : 'Guardar y Calcular Puntos'}
                            </button>
                        </form>
                    ))}
                </div>
            )}

            {finishedMatches.length > 0 && (
                <>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 mt-6">Partidos Finalizados</h3>
                    <div className="flex flex-col gap-2">
                        {finishedMatches.map((m) => (
                            <div key={m.id} className="bg-black/20 rounded-lg p-3 border border-white/5 flex justify-between items-center">
                                <span className="text-sm text-gray-300">
                                    {m.home?.name || 'Local'} vs {m.away?.name || 'Visitante'}
                                </span>
                                <span className="font-heading font-bold text-white text-lg">
                                    {m.home_goals_real} - {m.away_goals_real}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
