"use client";

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, Clock, MessageCircle, ShieldAlert } from 'lucide-react';

export default function PendingApprovalPage() {
    const supabase = createClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-red)]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-purple)]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-lg bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-neon-red)]/20 rounded-3xl p-10 shadow-2xl z-10 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-neon-red)]/10 flex items-center justify-center border border-[var(--color-neon-red)]/30 shadow-[0_0_20px_rgba(255,49,49,0.2)]">
                        <Clock size={40} className="text-[var(--color-neon-red)] animate-pulse" />
                    </div>
                </div>

                <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">
                    Cuenta <span className="text-[var(--color-neon-red)]">Inactiva</span>
                </h1>
                
                <div className="space-y-4 mb-10">
                    <p className="text-gray-300 font-medium">
                        Tu cuenta ha sido creada exitosamente, pero aún no tienes acceso completo a la plataforma de pronósticos.
                    </p>
                    <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-left flex gap-4 items-start">
                        <ShieldAlert className="text-[var(--color-neon-cyan)] shrink-0" size={20} />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-2">¿Por qué veo esto?</p>
                            <p className="text-sm text-gray-300">
                                Para participar, tu inscripción debe ser validada por el administrador tras la confirmación del pago.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <a 
                        href="https://wa.me/573004561234" // Podrías cambiar esto por el número real
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[var(--color-neon-green)] text-black font-bold font-heading hover:brightness-110 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all uppercase tracking-widest"
                    >
                        <MessageCircle size={20} />
                        Contactar Administrador
                    </a>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold font-heading hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>

                <p className="mt-10 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black italic">
                    Una vez seas aprobado, verás los partidos automáticamente.
                </p>
            </div>
        </main>
    );
}
