"use client";

import React, { useState, useTransition } from 'react';
import { toggleUserPaid, deleteUser } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    nickname: string | null;
    is_paid: boolean | null;
    total_points: number | null;
    created_at: string | null;
    porras?: { id: string, name: string, slug: string } | null;
}

export default function AdminUserList({ users }: { users: User[] }) {
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = (userId: string, newState: boolean) => {
        startTransition(async () => {
            const result = await toggleUserPaid(userId, newState);
            if (result.error) {
                setFeedback(prev => ({ ...prev, [userId]: result.error! }));
            } else {
                setFeedback(prev => ({ ...prev, [userId]: newState ? '✅ Aprobado' : '⛔ Desactivado' }));
                router.refresh();
            }
        });
    };

    const handleDelete = (userId: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) return;

        startTransition(async () => {
            const result = await deleteUser(userId);
            if (result.error) {
                setFeedback(prev => ({ ...prev, [userId]: result.error! }));
            } else {
                setFeedback(prev => ({ ...prev, [userId]: '🗑️ Eliminado' }));
                router.refresh();
            }
        });
    };

    if (users.length === 0) {
        return <p className="text-gray-500 italic text-center py-6">No hay usuarios registrados.</p>;
    }

    // Agrupar usuarios por porra
    const groupedUsers = users.reduce((acc, user) => {
        const porraName = user.porras?.name || 'Usuarios Generales / Sin asignación';
        if (!acc[porraName]) {
            acc[porraName] = [];
        }
        acc[porraName].push(user);
        return acc;
    }, {} as Record<string, User[]>);

    return (
        <div className="flex flex-col gap-8">
            {Object.entries(groupedUsers).map(([porraName, porraUsers]) => (
                <div key={porraName} className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <h3 className="text-sm font-heading font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)]"></span>
                        {porraName} ({porraUsers.filter(u => feedback[u.id] !== '🗑️ Eliminado').length})
                    </h3>
                    <div className="flex flex-col gap-3">
                        {porraUsers
                            .filter(u => feedback[u.id] !== '🗑️ Eliminado')
                            .map((u) => (
                                <div key={u.id} className="bg-black/30 rounded-lg p-4 flex justify-between items-center border border-white/5 group hover:border-white/10 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-white">{u.nickname || u.display_name}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${u.is_paid ? 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)]' : 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)]'}`}>
                                            {u.is_paid ? 'Aprobado' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{u.display_name}</p>
                                    
                                    {feedback[u.id] && (
                                        <p className="text-xs mt-2 text-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 inline-block px-2 py-1 rounded">{feedback[u.id]}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggle(u.id, !(u.is_paid ?? false))}
                                        disabled={isPending}
                                        className={`px-3 py-1.5 font-bold rounded transition-all text-xs disabled:opacity-50 ${u.is_paid
                                            ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            : 'bg-[var(--color-neon-green)] text-black hover:brightness-110 shadow-lg'
                                            }`}
                                    >
                                        {u.is_paid ? 'Desactivar' : 'Aprobar'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id, u.display_name)}
                                        disabled={isPending}
                                        className="bg-red-600/20 text-red-500 hover:bg-red-600/40 p-2 rounded transition-all disabled:opacity-50"
                                        title="Borrar Usuario"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
