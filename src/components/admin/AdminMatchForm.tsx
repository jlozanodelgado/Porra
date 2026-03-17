"use client";

import React, { useState, useTransition } from 'react';
import { upsertMatch, deleteMatch } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { formatToColombiaTime, getColombiaDatetimeLocal } from '@/utils/date-helpers';

interface Team {
    id: number;
    name: string;
}

interface Match {
    id: number;
    home_team_id: number | null;
    away_team_id: number | null;
    kickoff_time: string;
    is_playoff: boolean;
    status: string;
    home?: { name: string } | null;
    away?: { name: string } | null;
}

export default function AdminMatchForm({ teams, matches }: { teams: Team[]; matches: Match[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Convertir la hora ingresada (Colombia) a UTC
        const kickoffTimeCol = formData.get('kickoffTime') as string;
        if (kickoffTimeCol) {
            const utcDate = new Date(kickoffTimeCol + '-05:00').toISOString();
            formData.set('kickoffTime', utcDate);
        }

        startTransition(async () => {
            const result = await upsertMatch(formData);
            if (result?.error) {
                setFeedback(result.error);
            } else {
                setFeedback('✅ Partido guardado correctamente');
                setEditingId(null);
                setShowNew(false);
                router.refresh();
            }
        });
    };

    const MatchFormFields = ({ match }: { match?: Match }) => (
        <>
            {match && <input type="hidden" name="matchId" value={match.id} />}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Local</label>
                    <select
                        name="homeTeamId"
                        defaultValue={match?.home_team_id ?? ''}
                        required
                        className="w-full bg-[var(--color-surface)] border border-white/20 p-2 rounded text-white text-sm"
                    >
                        <option value="">Seleccionar...</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Visitante</label>
                    <select
                        name="awayTeamId"
                        defaultValue={match?.away_team_id ?? ''}
                        required
                        className="w-full bg-[var(--color-surface)] border border-white/20 p-2 rounded text-white text-sm"
                    >
                        <option value="">Seleccionar...</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Fecha y Hora (Colombia)</label>
                    <input
                        type="datetime-local"
                        name="kickoffTime"
                        defaultValue={match?.kickoff_time ? getColombiaDatetimeLocal(match.kickoff_time) : ''}
                        required
                        className="w-full bg-[var(--color-surface)] border border-white/20 p-2 rounded text-white text-sm"
                    />
                </div>
                <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isPlayoff"
                            value="true"
                            defaultChecked={match?.is_playoff ?? false}
                            className="accent-[var(--color-neon-purple)] w-4 h-4"
                        />
                        Playoff
                    </label>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[var(--color-neon-cyan)] text-black px-4 py-2 font-bold rounded text-sm hover:brightness-110 transition-all disabled:opacity-50"
                >
                    {isPending ? 'Guardando...' : 'Guardar Partido'}
                </button>
                <button
                    type="button"
                    onClick={() => { setEditingId(null); setShowNew(false); }}
                    className="text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </>
    );

    return (
        <div>
            {feedback && (
                <p className={`text-xs mb-3 font-bold ${feedback.includes('Error') ? 'text-[var(--color-neon-red)]' : 'text-[var(--color-neon-green)]'}`}>
                    {feedback}
                </p>
            )}

            {/* Lista de partidos existentes */}
            <div className="flex flex-col gap-3 mb-4">
                {matches.map((m) => (
                    <div key={m.id} className="bg-black/30 rounded-lg p-4 border border-white/5">
                        {editingId === m.id ? (
                            <form onSubmit={handleSubmit}>
                                <MatchFormFields match={m} />
                            </form>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white text-sm">
                                        {m.home?.name || `Equipo ${m.home_team_id}`} vs {m.away?.name || `Equipo ${m.away_team_id}`}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatToColombiaTime(m.kickoff_time)} — {m.is_playoff ? '🏆 Playoff' : '⚽ Grupo'} — {m.status}
                                    </p>
                                </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setEditingId(m.id)}
                                            className="text-[var(--color-neon-cyan)] text-sm font-semibold hover:underline"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de que quieres eliminar este partido?')) {
                                                    startTransition(async () => {
                                                        const result = await deleteMatch(m.id);
                                                        if (result?.error) {
                                                            setFeedback(result.error);
                                                        } else {
                                                            setFeedback('✅ Partido eliminado correctamente');
                                                            router.refresh();
                                                        }
                                                    });
                                                }
                                            }}
                                            className="text-[var(--color-neon-red)] text-sm font-semibold hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                        )}
                    </div>
                ))}

                {matches.length === 0 && (
                    <p className="text-gray-500 italic text-center py-4">No hay partidos creados aún.</p>
                )}
            </div>

            {/* Formulario para crear nuevo partido */}
            {showNew ? (
                <form onSubmit={handleSubmit} className="bg-black/30 rounded-lg p-4 border border-[var(--color-neon-cyan)]/30">
                    <h3 className="text-sm font-bold text-[var(--color-neon-cyan)] mb-3">Nuevo Partido</h3>
                    <MatchFormFields />
                </form>
            ) : (
                <button
                    onClick={() => setShowNew(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-[var(--color-neon-cyan)]/30 text-[var(--color-neon-cyan)] font-heading font-bold text-sm hover:bg-[var(--color-neon-cyan)]/10 transition-all"
                >
                    + Crear Nuevo Partido
                </button>
            )}
        </div>
    );
}
