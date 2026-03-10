"use client";

import React, { useState, useTransition } from 'react';
import { createTeam } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function AdminTeamForm() {
    const [feedback, setFeedback] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createTeam(formData);
            if (result?.error) {
                setFeedback(result.error);
            } else {
                setFeedback('✅ Equipo creado correctamente');
                (e.target as HTMLFormElement).reset();
                router.refresh();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-black/30 rounded-lg p-6 border border-[var(--color-neon-cyan)]/30">
            <h3 className="text-lg font-bold text-[var(--color-neon-cyan)] mb-4 uppercase tracking-wider">Nuevo Equipo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Nombre del Equipo</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Ej: Colombia"
                        className="w-full bg-[var(--color-surface)] border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Grupo (A-L)</label>
                    <input
                        type="text"
                        name="groupName"
                        required
                        maxLength={1}
                        placeholder="A"
                        className="w-full bg-[var(--color-surface)] border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">URL de la Bandera (Opcional)</label>
                <input
                    type="url"
                    name="flagUrl"
                    placeholder="https://example.com/flag.png"
                    className="w-full bg-[var(--color-surface)] border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                />
            </div>

            {feedback && (
                <p className={`text-sm mb-4 font-bold ${feedback.includes('Error') ? 'text-[var(--color-neon-red)]' : 'text-[var(--color-neon-green)]'}`}>
                    {feedback}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[var(--color-neon-cyan)] text-black py-3 rounded-xl font-heading font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50"
            >
                {isPending ? 'Guardando...' : 'Insertar Equipo'}
            </button>
        </form>
    );
}
