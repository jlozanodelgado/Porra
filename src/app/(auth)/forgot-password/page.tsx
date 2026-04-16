"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { requestPasswordReset } from '@/app/actions';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 1. Extraemos todo el contenido a este componente
function ForgotPasswordContent() {
    const searchParams = useSearchParams();
    const nicknameParam = searchParams.get('nickname');

    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'alert' | 'error', text: string } | null>(null);
    const [successEmail, setSuccessEmail] = useState('');

    useEffect(() => {
        if (nicknameParam) {
            setIdentifier(nicknameParam);
            setMessage({
                type: 'alert',
                text: `Ingresa tu apodo o correo para enviarte las instrucciones. Si usas tu apodo "${nicknameParam}", buscaremos tu correo registrado.`
            });
        }
    }, [nicknameParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await requestPasswordReset(identifier);

        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setSuccessEmail(result.email || '');
            setMessage({
                type: 'success',
                text: `Se ha enviado un correo a ${result.email || 'tu cuenta'} con las instrucciones para restablecer tu contraseña.`
            });
            setIdentifier('');
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-purple)]/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10 transition-all">
                <div className="mb-8">
                    <Link href="/login" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition-colors font-body">
                        <ArrowLeft size={16} />
                        Volver al inicio de sesión
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Recuperar Contraseña</h1>
                    <p className="text-gray-400 font-body text-sm">Ingresa tu correo electrónico o tu apodo para recibir un enlace de recuperación.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-body">
                    <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Apodo o Correo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all"
                                placeholder="usuario o email@ejemplo.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg text-sm font-medium flex gap-3 ${message.type === 'success'
                                ? 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] border border-[var(--color-neon-green)]/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]'
                                : message.type === 'alert'
                                    ? 'bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] border border-[var(--color-neon-cyan)]/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]'
                                    : 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)] border border-[var(--color-neon-red)]/20'
                            }`}>
                            {message.type === 'success' && <CheckCircle2 className="shrink-0" size={18} />}
                            {message.type === 'alert' && <Mail className="shrink-0 opacity-50" size={18} />}
                            <p>
                                {message.type === 'success' ? (
                                    <>
                                        Se ha enviado un correo a <strong className="text-white underline decoration-[var(--color-neon-green)]/50">{successEmail}</strong> con las instrucciones para restablecer tu contraseña.
                                    </>
                                ) : message.text}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-lg bg-white text-black font-black font-heading uppercase tracking-widest hover:bg-[var(--color-neon-cyan)] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Enviando...' : (
                            <>
                                Enviar Instrucciones
                                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}

// 2. Exportamos la página principal envolviendo el contenido en Suspense
export default function ForgotPasswordPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                    <div className="text-[var(--color-neon-cyan)] font-body animate-pulse">Cargando...</div>
                </main>
            }
        >
            <ForgotPasswordContent />
        </Suspense>
    );
}