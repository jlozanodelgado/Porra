"use client";

import React, { useState } from 'react';
import { updatePassword } from '@/app/actions';
import { Lock, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);

        const result = await updatePassword(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-[var(--color-neon-green)]/20 rounded-full flex items-center justify-center border border-[var(--color-neon-green)]/30">
                            <CheckCircle2 size={40} className="text-[var(--color-neon-green)]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-4">¡Contraseña Actualizada!</h1>
                    <p className="text-gray-400 font-body mb-8">Tu contraseña ha sido restablecida con éxito. Serás redirigido al inicio de sesión en unos segundos.</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="w-full py-3 rounded-lg bg-[var(--color-neon-green)] text-black font-bold font-heading hover:brightness-110 transition-all"
                    >
                        Ir al Login ahora
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-purple)]/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10 transition-all">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Nueva Contraseña</h1>
                    <p className="text-gray-400 font-body text-sm">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-body">
                    <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all"
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all"
                                placeholder="Repite la contraseña"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg text-sm bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)] border border-[var(--color-neon-red)]/20 font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-lg bg-[var(--color-neon-green)] text-black font-black font-heading uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <Save size={18} />
                                Actualizar Contraseña
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
