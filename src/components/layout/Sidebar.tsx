"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Trophy,
    Users,
    ClipboardList,
    LayoutGrid,
    BookOpen,
    Shield,
    Menu,
    X,
    Home,
    LogOut,
    UserMinus,
    UserCheck,
    Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    isAdmin: boolean;
    displayName: string;
}

const participantItems = [
    { href: '/leaderboard', label: 'Clasificación', icon: BarChart3 },
    { href: '/predictions', label: 'Hoja de Predicciones', icon: ClipboardList },
    { href: '/dashboard', label: 'Partidos', icon: Trophy },
    { href: '/teams', label: 'Equipos', icon: Users },
    { href: '/groups', label: 'Grupos', icon: LayoutGrid },
    { href: '/dashboard/mis-predicciones', label: 'Mis Predicciones', icon: BookOpen },
];

const adminItems = [
    { href: '/admin/teams', label: 'Insertar Equipos', icon: Users },
    { href: '/admin#matches', label: 'Insertar Partidos', icon: Trophy },
    { href: '/admin#results', label: 'Insertar Marcador', icon: ClipboardList },
    { href: '/admin#users', label: 'Aprobar Usuarios', icon: UserCheck },
    { href: '/admin#users', label: 'Borrar Usuario', icon: UserMinus },
];

export default function Sidebar({ isAdmin, displayName }: SidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const allItems = isAdmin ? adminItems : participantItems;

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo / Header */}
            <div className="p-5 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-neon-green)] to-[var(--color-neon-cyan)] flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.4)]">
                        <Home size={16} className="text-black" />
                    </div>
                    <span className="font-heading font-bold text-white text-sm uppercase tracking-wider">
                        Mundial 2026
                    </span>
                </Link>
            </div>

            {/* User Info */}
            <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Jugador</p>
                <p className="text-sm text-white font-semibold truncate mt-1">{displayName}</p>
                {isAdmin && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-neon-red)]/20 text-[var(--color-neon-red)] font-bold uppercase">
                        Admin
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-1 px-3">
                    {allItems.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-[var(--color-neon-cyan)]/15 text-[var(--color-neon-cyan)] shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon
                                        size={18}
                                        className={`transition-all ${isActive
                                            ? 'text-[var(--color-neon-cyan)] drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]'
                                            : 'text-gray-500 group-hover:text-gray-300'
                                            }`}
                                    />
                                    {item.label}
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_6px_var(--color-neon-cyan)]"></span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-[var(--color-neon-red)] hover:bg-[var(--color-neon-red)]/10 transition-all w-full"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--color-surface)]/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-gray-300 hover:text-white shadow-xl transition-all"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[var(--color-surface)]/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <NavContent />
            </aside>
        </>
    );
}
