"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const predictionSchema = z.object({
    homeGoals: z.coerce.number().min(0, "Mínimo 0").max(20, "Máximo 20"),
    awayGoals: z.coerce.number().min(0, "Mínimo 0").max(20, "Máximo 20"),
});

type PredictionFormData = z.infer<typeof predictionSchema>;

interface PredictionFormProps {
    matchId: number;
    userId: string;
    initialHomeGoals?: number | null;
    initialAwayGoals?: number | null;
    disabled: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
    matchId,
    userId,
    initialHomeGoals,
    initialAwayGoals,
    disabled
}) => {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<PredictionFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(predictionSchema) as any,
        defaultValues: {
            homeGoals: initialHomeGoals ?? 0,
            awayGoals: initialAwayGoals ?? 0,
        }
    });

    const onSubmit = async (data: PredictionFormData) => {
        setSaving(true);
        setMessage('');
        const { error } = await supabase.from('predictions').upsert({
            match_id: matchId,
            user_id: userId,
            home_goals_pred: data.homeGoals,
            away_goals_pred: data.awayGoals
        }, { onConflict: 'user_id,match_id' });

        if (error) {
            setMessage('Error al guardar pronóstico.');
            console.error(error);
        } else {
            setMessage('¡Pronóstico guardado con éxito!');
            router.refresh(); // Refresh server state
        }
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4 w-full bg-black/40 p-4 rounded-xl border border-white/5 mx-auto max-w-md">
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1 text-center">Goles Local</label>
                    <input
                        type="number"
                        disabled={disabled || saving}
                        className="bg-surface/50 border border-white/20 rounded-lg p-2 text-center text-2xl font-heading focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
                        {...register("homeGoals")}
                    />
                </div>
                <div className="text-xl font-bold text-gray-500">-</div>
                <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1 text-center">Goles Visitante</label>
                    <input
                        type="number"
                        disabled={disabled || saving}
                        className="bg-surface/50 border border-white/20 rounded-lg p-2 text-center text-2xl font-heading focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
                        {...register("awayGoals")}
                    />
                </div>
            </div>
            {(errors.homeGoals || errors.awayGoals) && (
                <span className="text-[var(--color-neon-red)] text-xs text-center">Asegura que los goles estén entre 0 y 20</span>
            )}
            {message && (
                <span className={`text-xs text-center font-bold ${message.includes('Error') ? 'text-[var(--color-neon-red)]' : 'text-[var(--color-neon-green)]'}`}>
                    {message}
                </span>
            )}
            <button
                type="submit"
                disabled={disabled || saving}
                className="mt-2 w-full py-3 rounded-lg bg-[var(--color-neon-green)] text-black font-bold font-heading disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-300 transition-all hover:brightness-110 shadow-lg"
            >
                {saving ? 'Guardando...' : disabled ? 'Bloqueado (Quedan < 15 min)' : 'Guardar Pronóstico'}
            </button>
        </form>
    );
};
