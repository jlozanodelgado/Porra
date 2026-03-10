"use client";

import React from 'react';
import Link from 'next/link';
import {
    Users,
    Trophy,
    ClipboardList,
    UserCheck,
    UserMinus,
    LayoutGrid,
    BookOpen,
    BarChart3,
    Shield
} from 'lucide-react';

interface MenuHubProps {
    isAdmin: boolean;
}

export default function MenuHub({ isAdmin }: MenuHubProps) {
    // Menú para Administradores
    const adminMenu = [
        { href: '/admin', label: 'Insertar equipos', icon: Users, color: 'text-[var(--color-neon-cyan)]', border: 'border-[var(--color-neon-cyan)]/30' },
        { href: '/admin', label: 'insertar partidos', icon: Trophy, color: 'text-[var(--color-neon-purple)]', border: 'border-[var(--color-neon-purple)]/30' },
        { href: '/admin', label: 'insertar marcador', icon: ClipboardList, color: 'text-[var(--color-neon-green)]', border: 'border-[var(--color-neon-green)]/30' },
        { href: '/admin', label: 'aprobar usuarios', icon: UserCheck, color: 'text-[var(--color-neon-cyan)]', border: 'border-[var(--color-neon-cyan)]/30' },
        { href: '/admin', label: 'borrar usuario', icon: UserMinus, color: 'text-[var(--color-neon-red)]', border: 'border-[var(--color-neon-red)]/30' },
    ];

    // Menú para Participantes
    const participantMenu = [
        { href: '/leaderboard', label: 'clasificación', icon: BarChart3, color: 'text-[var(--color-neon-green)]', border: 'border-[var(--color-neon-green)]/30' },
        { href: '/predictions', label: 'hoja de predicciones', icon: ClipboardList, color: 'text-[var(--color-neon-cyan)]', border: 'border-[var(--color-neon-cyan)]/30' },
        { href: '/dashboard', label: 'partidos', icon: Trophy, color: 'text-[var(--color-neon-purple)]', border: 'border-[var(--color-neon-purple)]/30' },
        { href: '/teams', label: 'equipos', icon: Users, color: 'text-[var(--color-neon-cyan)]', border: 'border-[var(--color-neon-cyan)]/30' },
        { href: '/groups', label: 'grupos', icon: LayoutGrid, color: 'text-[var(--color-neon-green)]', border: 'border-[var(--color-neon-green)]/30' },
        { href: '/dashboard/mis-predicciones', label: 'predicciones del jugador', icon: BookOpen, color: 'text-[var(--color-neon-purple)]', border: 'border-[var(--color-neon-purple)]/30' },
    ];

    const currentMenu = isAdmin ? adminMenu : participantMenu;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-heading font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                {isAdmin ? <Shield className="text-[var(--color-neon-red)]" /> : <Trophy className="text-[var(--color-neon-cyan)]" />}
                Menu Principal {isAdmin ? 'Admin' : 'Participante'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMenu.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`group relative bg-[var(--color-surface)]/40 backdrop-blur-md border ${item.border} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:bg-[var(--color-surface)]/60 shadow-xl overflow-hidden`}
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon size={120} />
                            </div>

                            <div className={`p-3 rounded-xl bg-white/5 inline-block mb-4 group-hover:bg-white/10 transition-colors`}>
                                <Icon className={`${item.color} group-hover:scale-110 transition-transform`} size={28} />
                            </div>

                            <h3 className="text-white font-heading font-bold text-lg uppercase group-hover:text-[var(--color-neon-cyan)] transition-colors">
                                {item.label}
                            </h3>

                            <div className="mt-4 flex items-center text-gray-500 text-xs font-semibold uppercase tracking-tighter group-hover:text-gray-300 transition-colors">
                                Explorar Sección <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
