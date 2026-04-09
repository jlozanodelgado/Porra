"use client";

import React, { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { updateTeam, deleteTeam } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface EditTeamModalProps {
    team: {
        id: number;
        name: string;
        flag_url: string | null;
        group_name: string | null;
    };
    onClose: () => void;
}

export default function EditTeamModal({ team, onClose }: EditTeamModalProps) {
    const [feedback, setFeedback] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteTeam(team.id);
        if (result?.error) {
            setFeedback(`Error: ${result.error}`);
            setIsDeleting(false);
            setShowConfirmDelete(false);
        } else {
            setFeedback('✅ Equipo eliminado correctamente');
            setTimeout(() => {
                onClose();
                router.refresh();
            }, 1000);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateTeam(formData);
            if (result?.error) {
                setFeedback(`Error: ${result.error}`);
            } else {
                setFeedback('✅ Equipo actualizado correctamente');
                setTimeout(() => {
                    onClose();
                    router.refresh();
                }, 1000);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">
                        {showConfirmDelete ? '¿Eliminar Equipo?' : 'Editar Selección'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {showConfirmDelete ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                                <div className="w-12 h-8 bg-white/5 rounded overflow-hidden flex-shrink-0 border border-white/10">
                                    {team.flag_url && <img src={team.flag_url} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{team.name}</p>
                                    <p className="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
                                </div>
                            </div>

                            {feedback && (
                                <div className="p-3 rounded-lg text-sm font-bold text-center bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)]">
                                    {feedback}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="flex-1 bg-white/5 text-white hover:bg-white/10 py-3 rounded-xl font-heading font-bold text-sm transition-all border border-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-[var(--color-neon-red)] text-white py-3 rounded-xl font-heading font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] disabled:opacity-50"
                                >
                                    {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <input type="hidden" name="teamId" value={team.id} />
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Nombre del Equipo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        defaultValue={team.name}
                                        className="w-full bg-black/30 border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Grupo (A-L)</label>
                                    <input
                                        type="text"
                                        name="groupName"
                                        required
                                        maxLength={1}
                                        defaultValue={team.group_name || ''}
                                        className="w-full bg-black/30 border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">URL de la Bandera</label>
                                    <input
                                        type="url"
                                        name="flagUrl"
                                        defaultValue={team.flag_url || ''}
                                        className="w-full bg-black/30 border border-white/20 p-2.5 rounded text-white text-sm focus:border-[var(--color-neon-cyan)] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {feedback && (
                                <div className={`p-3 rounded-lg text-sm mb-4 font-bold text-center ${feedback.includes('Error') ? 'bg-[var(--color-neon-red)]/10 text-[var(--color-neon-red)]' : 'bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)]'}`}>
                                    {feedback}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 bg-white/5 text-white hover:bg-white/10 py-3 rounded-xl font-heading font-bold text-sm transition-all border border-white/10"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="flex-[2] bg-[var(--color-neon-cyan)] text-black py-3 rounded-xl font-heading font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50"
                                    >
                                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmDelete(true)}
                                    className="w-full text-[var(--color-neon-red)] text-xs font-bold uppercase tracking-widest py-2 hover:bg-[var(--color-neon-red)]/5 rounded-lg transition-all"
                                >
                                    Eliminar Selección
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
