"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function PorraLoginPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const supabase = createClient();

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Obtener el correo electrónico asociado a este nickname
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_nickname', {
            p_nickname: nickname
        });

        if (rpcError || !emailData) {
            setError('Apodo incorrecto o no encontrado.');
            setLoading(false);
            return;
        }

        const email = emailData as string;

        // Iniciar sesión con Supabase Auth usando el correo y la contraseña
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError('Contraseña incorrecta.');
            setLoading(false);
        } else if (data.user) {
            // Verificar si el usuario está aprobado
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_paid, is_admin, porra_id')
                .eq('id', data.user.id)
                .single();

            // Verificar que el usuario pertenece a esta porra
            const { data: porra } = await supabase
                .from('porras')
                .select('slug')
                .eq('id', profile?.porra_id)
                .single();

            if (porra?.slug !== slug) {
                await supabase.auth.signOut();
                setError('Este usuario no pertenece a esta porra.');
                setLoading(false);
                return;
            }

            if (profile?.is_paid || profile?.is_admin) {
                router.push(`/porra/${slug}/dashboard`);
            } else {
                router.push('/pending-approval');
            }
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--porra-secondary,var(--color-neon-cyan))]/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Iniciar Sesión</h1>
                    <p className="text-gray-400 font-body text-sm">Ingresa tus credenciales para participar.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4 font-body">
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Apodo (Usuario)</label>
                        <input
                            type="text"
                            required
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-primary,var(--color-neon-cyan))] focus:outline-none focus:ring-1 focus:ring-[var(--porra-primary,var(--color-neon-cyan))] transition-colors"
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
                            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-primary,var(--color-neon-cyan))] focus:outline-none focus:ring-1 focus:ring-[var(--porra-primary,var(--color-neon-cyan))] transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-[var(--color-neon-red)] text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full py-3 rounded-lg font-bold font-heading transition-all hover:brightness-110 shadow-[0_0_10px_var(--porra-primary,var(--color-neon-green))]"
                        style={{
                            backgroundColor: 'var(--porra-primary, var(--color-neon-green))',
                            color: '#000',
                        }}
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    ¿No tienes cuenta? <a href={`/porra/${slug}/register`} className="text-[var(--porra-secondary,var(--color-neon-cyan))] hover:underline">Regístrate aquí</a>
                </p>

                <p className="mt-4 text-center text-sm text-gray-500">
                    <a href="/forgot-password" className="hover:text-[var(--porra-primary,var(--color-neon-cyan))] transition-colors">
                        ¿Olvidaste tu contraseña?
                    </a>
                </p>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <a href={`/porra/${slug}`} className="text-gray-500 hover:text-[var(--porra-secondary,var(--color-neon-cyan))] text-sm transition-colors">
                        ← Volver a la porra
                    </a>
                </div>
            </div>
        </main>
    );
}