"use client";

import React, { useState, useTransition } from 'react';
import { bulkUpsertMatches } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Send, Calendar } from 'lucide-react';
import { getColombiaDatetimeLocal } from '@/utils/date-helpers';

interface Team {
    id: number;
    name: string;
}

interface NewMatch {
    homeTeamId: string;
    awayTeamId: string;
    kickoffTime: string;
    isPlayoff: boolean;
}

export default function AdminBulkMatchForm({ teams }: { teams: Team[] }) {
    const [matches, setMatches] = useState<NewMatch[]>([
        { homeTeamId: '', awayTeamId: '', kickoffTime: '', isPlayoff: false }
    ]);
    const [feedback, setFeedback] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const addMatch = () => {
        setMatches([...matches, { homeTeamId: '', awayTeamId: '', kickoffTime: '', isPlayoff: false }]);
    };

    const removeMatch = (index: number) => {
        if (matches.length > 1) {
            setMatches(matches.filter((_, i) => i !== index));
        }
    };

    const updateMatch = (index: number, field: keyof NewMatch, value: any) => {
        const newMatches = [...matches];
        newMatches[index] = { ...newMatches[index], [field]: value };
        setMatches(newMatches);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar que todos tengan equipos y fecha
        const invalid = matches.some(m => !m.homeTeamId || !m.awayTeamId || !m.kickoffTime);
        if (invalid) {
            setFeedback('❌ Todos los campos son obligatorios para cada partido.');
            return;
        }

        // Convertir fechas a UTC
        const formattedData = matches.map(m => ({
            ...m,
            kickoffTime: new Date(m.kickoffTime + '-05:00').toISOString()
        }));

        startTransition(async () => {
            const result = await bulkUpsertMatches(formattedData);
            if (result?.error) {
                setFeedback(result.error);
            } else {
                setFeedback('✅ Carga masiva completada con éxito');
                setMatches([{ homeTeamId: '', awayTeamId: '', kickoffTime: '', isPlayoff: false }]);
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar size={120} />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_8px_var(--color-neon-cyan)]"></span>
                        Carga Masiva de Partidos
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Añade múltiples encuentros de una sola vez</p>
                </div>
                <button
                    type="button"
                    onClick={addMatch}
                    className="flex items-center gap-2 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] border border-[var(--color-neon-cyan)]/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--color-neon-cyan)]/20 transition-all"
                >
                    <Plus size={16} />
                    Añadir Fila
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
                    {matches.map((match, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-black/20 p-4 rounded-xl border border-white/5 relative group">
                            <div className="md:col-span-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Local</label>
                                <select
                                    value={match.homeTeamId}
                                    onChange={(e) => updateMatch(idx, 'homeTeamId', e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm text-white focus:border-[var(--color-neon-cyan)] outline-none"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Visitante</label>
                                <select
                                    value={match.awayTeamId}
                                    onChange={(e) => updateMatch(idx, 'awayTeamId', e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm text-white focus:border-[var(--color-neon-cyan)] outline-none"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Fecha (Col)</label>
                                <input
                                    type="datetime-local"
                                    value={match.kickoffTime}
                                    onChange={(e) => updateMatch(idx, 'kickoffTime', e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm text-white focus:border-[var(--color-neon-cyan)] outline-none"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-center gap-4 py-2">
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={match.isPlayoff}
                                        onChange={(e) => updateMatch(idx, 'isPlayoff', e.target.checked)}
                                        className="accent-[var(--color-neon-purple)]"
                                    />
                                    Playoff
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeMatch(idx)}
                                    className="text-gray-600 hover:text-[var(--color-neon-red)] transition-colors p-1"
                                    title="Quitar esta fila"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/5 rounded-full group-hover:bg-[var(--color-neon-purple)] transition-all"></div>
                        </div>
                    ))}
                </div>

                {feedback && (
                    <div className={`p-4 rounded-xl text-sm mb-6 font-bold text-center border ${feedback.includes('Error') || feedback.includes('❌') ? 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)] border-[var(--color-neon-red)]/30' : 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30'}`}>
                        {feedback}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-cyan)] text-black py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl disabled:opacity-50"
                >
                    <Send size={18} />
                    {isPending ? 'Procesando Carga...' : `Publicar ${matches.length} Partidos`}
                </button>
            </form>
        </div>
    );
}
