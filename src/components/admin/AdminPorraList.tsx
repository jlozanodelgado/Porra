"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updatePorra, deletePorra } from '@/app/actions';
import { Pencil, Trash2, Palette } from 'lucide-react';

interface Porra {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    created_at: string | null;
}

interface AdminPorraListProps {
    porras: Porra[];
}

export default function AdminPorraList({ porras }: AdminPorraListProps) {
    const [editingPorra, setEditingPorra] = useState<Porra | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleEdit = async (formData: FormData) => {
        const result = await updatePorra(formData);
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Porra actualizada correctamente' });
            setEditingPorra(null);
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const handleDelete = async (porraId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta porra?')) return;

        const result = await deletePorra(porraId);
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
            setDeletingId(null);
        } else {
            setMessage({ type: 'success', text: 'Porra eliminada correctamente' });
            setDeletingId(null);
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : 'bg-[var(--color-neon-red)]/20 text-[var(--color-neon-red)]'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {porras.map((porra) => (
                    <div
                        key={porra.id}
                        className="bg-[var(--color-surface)]/50 border border-white/10 rounded-xl p-6 hover:border-[var(--color-neon-cyan)]/30 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {porra.logo_url ? (
                                    <img src={porra.logo_url} alt={porra.name} className="w-10 h-10 rounded-lg object-contain bg-white/10" />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: (porra.primary_color || '#00ff00') + '30' }}
                                    >
                                        <Palette size={20} style={{ color: porra.primary_color || '#00ff00' }} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-heading font-bold text-white">{porra.name}</h3>
                                    <a 
                                        href={`/porra/${porra.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] sm:text-xs text-[var(--color-neon-cyan)] hover:opacity-80 transition-opacity font-mono mt-1 break-all flex items-center gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(window.location.origin + `/porra/${porra.slug}`);
                                            setMessage({ type: 'success', text: '¡Enlace copiado al portapapeles!' });
                                            // Reset message after 3 seconds
                                            setTimeout(() => setMessage(null), 3000);
                                        }}
                                        title="Clic para copiar enlace"
                                    >
                                        <span className="opacity-50 inline-block truncate max-w-[150px] sm:max-w-xs align-bottom">
                                            {typeof window !== 'undefined' ? window.location.origin : ''}
                                        </span>
                                        /porra/{porra.slug}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <div
                                className="flex-1 h-8 rounded-lg"
                                style={{ backgroundColor: (porra.primary_color || '#00ff00') + '30', border: `1px solid ${porra.primary_color || '#00ff00'}` }}
                                title={`Primary: ${porra.primary_color}`}
                            />
                            <div
                                className="flex-1 h-8 rounded-lg"
                                style={{ backgroundColor: (porra.secondary_color || '#00ffff') + '30', border: `1px solid ${porra.secondary_color || '#00ffff'}` }}
                                title={`Secondary: ${porra.secondary_color}`}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingPorra(porra)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/30 transition-colors text-sm font-medium"
                            >
                                <Pencil size={14} />
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    setDeletingId(porra.id);
                                    handleDelete(porra.id);
                                }}
                                disabled={deletingId === porra.id}
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--color-neon-red)]/20 text-[var(--color-neon-red)] hover:bg-[var(--color-neon-red)]/30 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingPorra && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-heading font-bold text-white mb-6">Editar Porra</h2>

                        <form onSubmit={(e) => { e.preventDefault(); handleEdit(new FormData(e.currentTarget)); }} className="space-y-4">
                            <input type="hidden" name="porraId" value={editingPorra.id} />

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingPorra.name}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    defaultValue={editingPorra.slug}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:border-[var(--color-neon-cyan)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">URL del Logo</label>
                                <input
                                    type="url"
                                    name="logoUrl"
                                    defaultValue={editingPorra.logo_url || ''}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Color Primario</label>
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        defaultValue={editingPorra.primary_color}
                                        className="w-full h-10 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Color Secundario</label>
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        defaultValue={editingPorra.secondary_color}
                                        className="w-full h-10 rounded-lg cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingPorra(null)}
                                    className="flex-1 py-3 rounded-lg bg-white/10 text-gray-400 hover:text-white transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-lg bg-[var(--color-neon-cyan)] text-black font-bold hover:brightness-110 transition-all"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}