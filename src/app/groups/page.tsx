import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';

export default async function GroupsPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name, nickname, avatar_url')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.nickname || profile?.display_name || 'Usuario';
    const avatarUrl = profile?.avatar_url;
    const nickname = profile?.nickname || '';

    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .order('group_name', { ascending: true })
        .order('name', { ascending: true });

    // Agrupar equipos por group_name
    const groups: Record<string, any[]> = {};
    teams?.forEach(t => {
        const gn = t.group_name || 'Sin Grupo';
        if (!groups[gn]) groups[gn] = [];
        groups[gn].push(t);
    });

    const groupKeys = Object.keys(groups).sort();

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} avatarUrl={avatarUrl} nickname={nickname} />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                <header className="mb-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] text-xs font-bold uppercase tracking-widest mb-4">
                        <LayoutGrid size={14} />
                        Fase de Grupos
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white uppercase">Organización del Torneo</h1>
                    <p className="text-gray-400 mt-2">Los 12 grupos de 4 equipos cada uno.</p>
                </header>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {groupKeys.map((gk) => (
                        <div key={gk} className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:bg-[var(--color-surface)]/50">
                            <div className="bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)] py-3 px-6">
                                <h2 className="text-black font-heading font-black text-xl uppercase italic tracking-tighter">Grupo {gk}</h2>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                {groups[gk].map((t) => (
                                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-8 h-5 rounded overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                                            {t.flag_url && <img src={t.flag_url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-white font-bold text-sm">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
