import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminTeamForm from '@/components/admin/AdminTeamForm';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import EditTeamButton from '@/components/admin/EditTeamButton';

export default async function AdminTeamsPage() {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verificar que es admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) redirect('/dashboard');

    // Cargar equipos existentes
    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .order('group_name', { ascending: true })
        .order('name', { ascending: true });

    return (
        <main className="min-h-screen bg-[var(--color-background)] p-6">
            <header className="mb-8 max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2 text-[var(--color-neon-cyan)] hover:brightness-125 transition-all font-semibold">
                    <ArrowLeft size={18} />
                    <span>Volver al Panel</span>
                </Link>
                <div className="flex items-center gap-2 text-white/40 font-heading font-bold text-sm uppercase tracking-widest">
                    <Users size={16} />
                    Gestión de Equipos
                </div>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulario a la izquierda (1/3) */}
                <div className="md:col-span-1">
                    <AdminTeamForm />
                </div>

                {/* Lista a la derecha (2/3) */}
                <div className="md:col-span-2">
                    <div className="bg-[var(--color-surface)]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-heading font-bold text-white mb-6 flex justify-between items-center">
                            Equipos Registrados
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">{teams?.length || 0} Total</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {teams?.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 relative group">
                                    <EditTeamButton team={t} />
                                    <div className="w-10 h-7 bg-white/5 rounded overflow-hidden flex-shrink-0 border border-white/10">
                                        {t.flag_url ? (
                                            <img src={t.flag_url} alt={t.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">?</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{t.name}</p>
                                        <p className="text-[var(--color-neon-cyan)] text-[10px] font-bold uppercase tracking-tighter">Grupo {t.group_name}</p>
                                    </div>
                                </div>
                            ))}
                            {(!teams || teams.length === 0) && (
                                <p className="col-span-full text-center text-gray-500 italic py-10">No hay equipos registrados todavía.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
