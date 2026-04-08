"use client";

import React, { useState } from 'react';
import { updatePassword } from '@/app/actions';
import { Lock, Save, ShieldCheck } from 'lucide-react';

export default function ChangePasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);

        const result = await updatePassword(formData);

        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' });
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <div className="bg-[var(--color-surface)]/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                <ShieldCheck size={20} className="text-[var(--color-neon-purple)]" />
                Seguridad
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-body">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2">Nueva Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-[var(--color-neon-purple)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-purple)] transition-all"
                            placeholder="Mínimo 6 caracteres"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-[var(--color-neon-purple)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-purple)] transition-all"
                            placeholder="Repite la contraseña"
                            disabled={loading}
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-xs font-medium ${
                        message.type === 'success' 
                        ? 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] border border-[var(--color-neon-green)]/20' 
                        : 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)] border border-[var(--color-neon-red)]/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[var(--color-neon-purple)] text-white font-bold text-sm uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(176,38,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : (
                        <>
                            <Save size={16} />
                            Actualizar Contraseña
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
