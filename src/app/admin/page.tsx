import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminUserList from '@/components/admin/AdminUserList';
import AdminMatchForm from '@/components/admin/AdminMatchForm';
import AdminResultForm from '@/components/admin/AdminResultForm';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verificar que es admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, display_name')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) redirect('/dashboard');

    const isAdmin = true;
    const displayName = profile?.display_name || 'Admin';

    // Cargar datos
    const { data: users } = await supabase
        .from('profiles')
        .select('id, display_name, is_paid, total_points, created_at')
        .order('created_at', { ascending: false });

    const { data: matches } = await supabase
        .from('matches')
        .select(`
            *,
            home:home_team_id (name),
            away:away_team_id (name)
        `)
        .order('kickoff_time', { ascending: true });

    const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .order('name', { ascending: true });

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar isAdmin={isAdmin} displayName={displayName} />
            <main className="flex-1 overflow-y-auto p-6">
                <header className="mb-6 max-w-6xl mx-auto flex justify-between items-center">
                    <a href="/" className="text-[var(--color-neon-cyan)] hover:underline font-semibold text-sm">
                        &larr; Volver al Inicio
                    </a>
                </header>

                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">
                        Panel de Control <span className="text-[var(--color-neon-red)] drop-shadow-[0_0_8px_var(--color-neon-red)]">ADMIN</span>
                    </h1>
                    <p className="text-gray-400 font-body mt-2">Solo Superusuarios</p>
                </header>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Panel 1: Gestión de Usuarios */}
                    <div id="users" className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-red)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-neon-red)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                        <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-neon-red)] shadow-[0_0_6px_var(--color-neon-red)]"></span>
                            Gestión de Usuarios
                        </h2>
                        <AdminUserList users={users ?? []} />
                    </div>

                    {/* Panel 2: Cargar Resultados */}
                    <div id="results" className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-cyan)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-neon-cyan)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                        <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_6px_var(--color-neon-cyan)]"></span>
                            Cargar Resultados Finales
                        </h2>
                        <AdminResultForm matches={(matches as any) ?? []} />
                    </div>

                    {/* Panel 3: Gestión de Partidos (full width) */}
                    <div id="matches" className="lg:col-span-2 bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-purple)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--color-neon-purple)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                        <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-neon-purple)] shadow-[0_0_6px_var(--color-neon-purple)]"></span>
                            Crear / Editar Partidos
                        </h2>
                        {(teams?.length ?? 0) === 0 ? (
                            <p className="text-[var(--color-neon-red)] text-sm">
                                ⚠️ No hay equipos en la base de datos. Primero debes agregar equipos a la tabla <code className="bg-black/40 px-1 rounded">teams</code> en Supabase.
                            </p>
                        ) : (
                            <AdminMatchForm teams={teams ?? []} matches={(matches as any) ?? []} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
