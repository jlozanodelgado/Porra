import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Users, Trophy, ClipboardList, ShieldCheck, CreditCard, Clock, Layers } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Obtener estadísticas rápidas
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: paidUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_paid', true);

    const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

    const { count: finishedMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished');

    const { count: pendingMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'finished');

    const { count: totalPorras } = await supabase
        .from('porras')
        .select('*', { count: 'exact', head: true });

    const stats = [
        { label: 'Usuarios Totales', value: totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Pagos Confirmados', value: paidUsers || 0, icon: CreditCard, color: 'text-[var(--color-neon-green)]', bg: 'bg-[var(--color-neon-green)]/10' },
        { label: 'Porras Activas', value: totalPorras || 0, icon: Layers, color: 'text-[var(--color-neon-red)]', bg: 'bg-[var(--color-neon-red)]/10' },
        { label: 'Partidos Totales', value: totalMatches || 0, icon: Trophy, color: 'text-[var(--color-neon-purple)]', bg: 'bg-[var(--color-neon-purple)]/10' },
        { label: 'Partidos Finalizados', value: finishedMatches || 0, icon: ShieldCheck, color: 'text-[var(--color-neon-cyan)]', bg: 'bg-[var(--color-neon-cyan)]/10' },
    ];

    const adminLinks = [
        { href: '/admin/porras', label: 'Gestionar Porras', description: 'Crear y editar porras para empresas', icon: Layers, color: 'border-[var(--color-neon-red)]/30', hover: 'hover:border-[var(--color-neon-red)]/60' },
        { href: '/admin/users', label: 'Gestionar Usuarios', description: 'Aprobar pagos y administrar perfiles', icon: Users, color: 'border-[var(--color-neon-red)]/30', hover: 'hover:border-[var(--color-neon-red)]/60' },
        { href: '/admin/matches', label: 'Configurar Partidos', description: 'Crear encuentros y editar horarios', icon: Trophy, color: 'border-[var(--color-neon-purple)]/30', hover: 'hover:border-[var(--color-neon-purple)]/60' },
        { href: '/admin/results', label: 'Cargar Resultados', description: 'Ingresar marcadores y calcular puntos', icon: ClipboardList, color: 'border-[var(--color-neon-cyan)]/30', hover: 'hover:border-[var(--color-neon-cyan)]/60' },
        { href: '/admin/predictions', label: 'Reporte Transparencia', description: 'Ver todas las predicciones bloqueadas', icon: ClipboardList, color: 'border-[var(--color-neon-green)]/30', hover: 'hover:border-[var(--color-neon-green)]/60' },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-heading font-bold text-white uppercase tracking-tight">
                    Panel de <span className="text-[var(--color-neon-red)] drop-shadow-[0_0_8px_var(--color-neon-red)]">ADMINISTRACIÓN</span>
                </h1>
                <p className="text-gray-400 font-body mt-2">Resumen general del mundial</p>
            </header>

            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-2xl font-bold text-white leading-none mb-1">{stat.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Accesos Directos */}
            <h2 className="text-xl font-heading font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-[1px] bg-white/20"></span>
                Accesos Directos
                <span className="w-8 h-[1px] bg-white/20"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminLinks.map((link, idx) => (
                    <Link 
                        key={idx} 
                        href={link.href}
                        className={`group bg-[var(--color-surface)]/60 backdrop-blur-md border ${link.color} ${link.hover} rounded-2xl p-8 transition-all duration-300 hover:transform hover:-translate-y-1`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                                <link.icon size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">{link.label}</h3>
                                <p className="text-gray-400 text-sm mt-1">{link.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
