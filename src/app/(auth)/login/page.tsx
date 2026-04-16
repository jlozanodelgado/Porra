"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Obtener el correo electrónico asociado a este nickname
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_nickname', {
            p_nickname: nickname
        });

        if (rpcError || !emailData) {
            setError('Apodo incorrecto o no encontrado.');
            return;
        }

        const email = emailData as string;

        // Iniciar sesión con Supabase Auth usando el correo y la contraseña
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError('Contraseña incorrecta.');
        } else if (data.user) {
            // Verificar si el usuario está aprobado
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_paid, is_admin')
                .eq('id', data.user.id)
                .single();

            if (profile?.is_paid || profile?.is_admin) {
                router.push('/dashboard');
            } else {
                router.push('/pending-approval');
            }
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-purple)]/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Bienvenido a la Porra</h1>
                    <p className="text-gray-400 font-body text-sm">Ingresa para dejar tus pronósticos del Mundial.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4 font-body">
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Apodo (Usuario)</label>
                        <input
                            type="text"
                            required
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
                            placeholder="Tu apodo"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
                            placeholder="••••••••"
                        />
                        <div className="flex justify-end mt-1">
                            <a 
                                href={nickname ? `/forgot-password?nickname=${encodeURIComponent(nickname)}` : "/forgot-password"} 
                                className="text-[10px] text-gray-400 hover:text-[var(--color-neon-cyan)] transition-colors uppercase tracking-widest font-black"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                    </div>
                    {error && <p className="text-[var(--color-neon-red)] text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="mt-4 w-full py-3 rounded-lg bg-[var(--color-neon-green)] text-black font-bold font-heading hover:brightness-110 shadow-[0_0_10px_var(--color-neon-green)] transition-all"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    ¿No tienes cuenta? <a href="/register" className="text-[var(--color-neon-cyan)] hover:underline">Regístrate aquí</a>
                </p>
            </div>
        </main>
    );
}
