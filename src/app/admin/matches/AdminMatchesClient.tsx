"use client";

import React, { useState } from 'react';
import AdminMatchForm from '@/components/admin/AdminMatchForm';
import AdminBulkMatchForm from '@/components/admin/AdminBulkMatchForm';
import { LayoutGrid, Layers } from 'lucide-react';

interface Team {
    id: number;
    name: string;
}

interface Match {
    id: number;
    home_team_id: number | null;
    away_team_id: number | null;
    kickoff_time: string;
    is_playoff: boolean;
    status: string;
    home?: { name: string } | null;
    away?: { name: string } | null;
}

export default function AdminMatchesClient({ teams, initialMatches }: { teams: Team[]; initialMatches: Match[] }) {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">
                    Gestión de <span className="text-[var(--color-neon-purple)] drop-shadow-[0_0_8px_var(--color-neon-purple)]">PARTIDOS</span>
                </h1>
                <p className="text-gray-400 font-body mt-2">Configura los encuentros del mundial</p>
            </header>

            {/* Tabs de Navegación */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'single'
                                ? 'bg-[var(--color-neon-purple)] text-black shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <LayoutGrid size={18} />
                        Individual
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'bulk'
                                ? 'bg-[var(--color-neon-purple)] text-black shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Layers size={18} />
                        Carga Masiva
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'single' ? (
                    <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-neon-purple)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--color-neon-purple)] rounded-full mix-blend-screen filter blur-[80px] opacity-15 pointer-events-none"></div>
                        <h2 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-neon-purple)] shadow-[0_0_6px_var(--color-neon-purple)]"></span>
                            Listado y Creación Individual
                        </h2>
                        
                        {teams.length === 0 ? (
                            <p className="text-[var(--color-neon-red)] text-sm">
                                ⚠️ No hay equipos en la base de datos.
                            </p>
                        ) : (
                            <AdminMatchForm teams={teams} matches={initialMatches} />
                        )}
                    </div>
                ) : (
                    <AdminBulkMatchForm teams={teams} />
                )}
            </div>
        </div>
    );
}
