import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, is_admin, display_name, nickname, avatar_url')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) redirect('/dashboard');

    const isAdmin = profile.is_admin;
    const displayName = profile.nickname || profile.display_name || 'Admin';
    const avatarUrl = profile.avatar_url;
    const nickname = profile.nickname || '';

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar 
                isAdmin={isAdmin} 
                displayName={displayName} 
                avatarUrl={avatarUrl} 
                nickname={nickname} 
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                <header className="mb-6 max-w-6xl mx-auto flex justify-between items-center">
                    <a href="/" className="text-[var(--color-neon-cyan)] hover:underline font-semibold text-sm">
                        &larr; Volver al Inicio
                    </a>
                </header>
                {children}
            </main>
        </div>
    );
}
