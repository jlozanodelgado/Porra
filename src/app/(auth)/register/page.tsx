"use client";

import React, { useState } from 'react';
import { registerUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await registerUser(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/pending-approval'), 2000);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--color-neon-green)]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Crear Cuenta</h1>
                    <p className="text-gray-400 font-body text-sm">Únete para participar en los pronósticos.</p>
                </div>

                {success ? (
                    <div className="text-center text-[var(--color-neon-green)] mb-4">
                        ¡Registro exitoso! Tu cuenta está pendiente de aprobación. Redirigiendo...
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="flex flex-col gap-4 font-body">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Nombre (Display)</label>
                            <input
                                type="text"
                                name="displayName"
                                required
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Apodo (Usuario)</label>
                            <input
                                type="text"
                                name="nickname"
                                required
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                placeholder="Ej. jperez99"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Celular (Opcional)</label>
                            <input
                                type="tel"
                                name="phone"
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                placeholder="Ej. +57 300 000 0000"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Correo Electrónico (Oculto en Login)</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                placeholder="tu@correo.com"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-[var(--color-neon-red)] text-sm">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full py-3 rounded-lg bg-[var(--color-neon-cyan)] text-black font-bold font-heading hover:brightness-110 shadow-[0_0_10px_var(--color-neon-cyan)] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-gray-400">
                    ¿Ya tienes cuenta? <a href="/login" className="text-[var(--color-neon-green)] hover:underline">Inicia sesión</a>
                </p>
            </div>
        </main>
    );
}
