import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Gift, Star, Award, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function PremiosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            display_name, 
            nickname, 
            is_admin, 
            avatar_url, 
            porra_id
        `)
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect('/login');
    }

    // Obtener datos de la porra (específica o la principal si no tiene asignada)
    let porra: any = null;
    if (profile.porra_id) {
        const { data } = await supabase
            .from('porras')
            .select('*')
            .eq('id', profile.porra_id)
            .single();
        porra = data;
    } else {
        // Fallback a la Porra Principal para usuarios generales
        const { data } = await supabase
            .from('porras')
            .select('*')
            .eq('slug', 'principal')
            .single();
        porra = data;
    }

    const prizes = (porra?.prize_config as any[]) || [];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar
                isAdmin={profile.is_admin ?? false}
                displayName={profile.nickname || profile.display_name}
                avatarUrl={profile.avatar_url}
                nickname={profile.nickname || ''}
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative flex flex-col items-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-neon-cyan)]/5 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-neon-purple)]/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="max-w-5xl mx-auto w-full space-y-12 pb-20">
                    
                    {/* Header */}
                    <div className="text-center space-y-4 pt-8">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/20 shadow-[0_0_30px_rgba(57,255,20,0.15)] mb-4 animate-bounce-slow">
                            <Trophy className="text-[var(--color-neon-green)]" size={40} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter italic">
                            Premios de la <span className="text-[var(--color-neon-green)]">{porra?.name || 'Porra'}</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            Esfuérzate al máximo y alcanza los primeros lugares para llevarte estas increíbles recompensas.
                        </p>
                    </div>

                    {/* Prizes Grid */}
                    {prizes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prizes.map((prize, index) => {
                                // Design helpers based on index
                                const isFirst = index === 0;
                                const isSecond = index === 1;
                                const isThird = index === 2;
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`group relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-[var(--color-neon-cyan)]/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden ${
                                            isFirst ? 'md:col-span-2 lg:col-span-1 ring-2 ring-[var(--color-neon-cyan)]/20 shadow-[0_0_40px_rgba(0,255,255,0.1)]' : ''
                                        }`}
                                    >
                                        {/* Background Glow */}
                                        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${
                                            isFirst ? 'bg-[var(--color-neon-cyan)]' : 
                                            isSecond ? 'bg-[var(--color-neon-green)]' : 
                                            'bg-[var(--color-neon-purple)]'
                                        }`} />

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${
                                                    isFirst ? 'text-[var(--color-neon-cyan)]' : 'text-gray-400'
                                                }`}>
                                                    {isFirst ? <Star size={24} fill="currentColor" /> : 
                                                     isSecond ? <Sparkles size={24} /> :
                                                     <Award size={24} />}
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 group-hover:text-white transition-colors">
                                                    Puesto #{index + 1}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-auto">
                                                <h3 className="text-xl font-heading font-black uppercase text-gray-100 group-hover:text-white transition-colors">
                                                    {prize.label}
                                                </h3>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-5xl font-heading font-black italic tracking-tighter ${
                                                        isFirst ? 'text-[var(--color-neon-cyan)] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 
                                                        'text-white animate-pulse-slow'
                                                    }`}>
                                                        {prize.value}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-4 leading-relaxed group-hover:text-gray-300 transition-colors">
                                                    {prize.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-surface/30 backdrop-blur-md border border-dashed border-white/10 rounded-3xl p-20 text-center space-y-6">
                            <Gift className="mx-auto text-gray-600 mb-4 opacity-20" size={80} />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-heading font-black text-gray-400 uppercase italic">Sin premios definidos</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    El administrador de <b>{porra?.name}</b> aún no ha configurado la tabla de premios para esta porra.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="bg-[var(--color-neon-cyan)]/5 border border-[var(--color-neon-cyan)]/10 rounded-2xl p-6 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-center">
                            * Los premios se entregarán al finalizar el torneo basándose en la tabla de posiciones oficial de la plataforma.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
