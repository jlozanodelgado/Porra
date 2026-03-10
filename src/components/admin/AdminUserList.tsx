"use client";

import React, { useState, useTransition } from 'react';
import { toggleUserPaid, deleteUser } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface User {
    id: string;
    display_name: string;
    is_paid: boolean;
    total_points: number;
    created_at: string;
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

    return (
        <div className="flex flex-col gap-3">
            {users.map((u) => (
                <div key={u.id} className="bg-black/30 rounded-lg p-4 flex justify-between items-center border border-white/5 group">
                    <div className="flex-1">
                        <p className="font-semibold text-white">{u.display_name}</p>
                        <p className="text-xs text-gray-400">
                            Puntos: {u.total_points} — {u.is_paid ? '✅ Pagado' : '⛔ No ha pagado'}
                        </p>
                        {feedback[u.id] && (
                            <p className="text-xs mt-1 text-[var(--color-neon-cyan)]">{feedback[u.id]}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleToggle(u.id, !u.is_paid)}
                            disabled={isPending}
                            className={`px-3 py-1.5 font-bold rounded transition-all text-xs disabled:opacity-50 ${u.is_paid
                                ? 'bg-[var(--color-neon-red)]/20 text-[var(--color-neon-red)] hover:bg-[var(--color-neon-red)]/30'
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
    );
}
