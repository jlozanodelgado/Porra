import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';

export default async function TeamsPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.display_name || 'Usuario';

    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true });

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} />
            <main className="flex-1 overflow-y-auto p-6">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-purple)]/10 border border-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] text-xs font-bold uppercase tracking-widest mb-4">
                        <Users size={14} />
                        Selecciones Nacionales
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white uppercase">Los Protagonistas</h1>
                    <p className="text-gray-400 mt-2">Conoce a los 48 equipos que buscarán la gloria en Norteamérica 2026.</p>
                </header>

                <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {teams?.map((t) => (
                        <div key={t.id} className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center hover:bg-[var(--color-surface)]/60 transition-all group">
                            <div className="w-full aspect-[3/2] bg-white/5 rounded-lg mb-3 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                {t.flag_url ? (
                                    <img src={t.flag_url} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                                        <span className="text-white/20 font-heading font-bold">{t.name.slice(0, 2).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-white font-bold text-sm text-center truncate w-full">{t.name}</h3>
                            <span className="text-[var(--color-neon-cyan)] text-[10px] font-black uppercase mt-1 tracking-widest">Grupo {t.group_name}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
