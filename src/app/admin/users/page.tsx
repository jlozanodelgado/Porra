import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminUserList from '@/components/admin/AdminUserList';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Cargar usuarios
    const { data: users } = await supabase
        .from('profiles')
        .select('id, display_name, nickname, is_paid, total_points, created_at, porras(id, name, slug)')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">
                    Gestión de <span className="text-[var(--color-neon-red)] drop-shadow-[0_0_8px_var(--color-neon-red)]">USUARIOS</span>
                </h1>
                <p className="text-gray-400 font-body mt-2">Aprobar, editar o eliminar participantes</p>
            </header>

            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-red)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-neon-red)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-neon-red)] shadow-[0_0_6px_var(--color-neon-red)]"></span>
                    Listado de Usuarios
                </h2>
                <AdminUserList users={users ?? []} />
            </div>
        </div>
    );
}
