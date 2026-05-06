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

        // 1. Obtener el correo electrónico asociado al nickname
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_nickname', {
            p_nickname: nickname
        });

        if (rpcError || !emailData) {
            setError('Apodo incorrecto o no encontrado.');
            return;
        }

        const email = emailData as string;

        // 2. Iniciar sesión con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError('Contraseña incorrecta.');
        } else if (data.user) {
            
            // 🚨 SOLUCIÓN AL PROBLEMA DE COOKIES/CACHÉ:
            // Refrescamos el router para limpiar la "memoria" de Next.js
            // Esto asegura que si antes había un usuario inactivo, el sistema
            // reconozca que ahora hay una sesión nueva.
            router.refresh();

            // 3. Verificar el estado del perfil (Aprobado o Admin)
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
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
            <div className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading font-black text-white italic tracking-tighter uppercase mb-2">
                        Bienvenido
                    </h1>
                    <p className="text-gray-400 font-body text-sm uppercase tracking-widest">
                        Ingresa a tu cuenta de La Porra
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Apodo (Nickname)</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
                            placeholder="Tu apodo"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-colors"
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
