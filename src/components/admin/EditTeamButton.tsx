"use client";

import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import EditTeamModal from './EditTeamModal';

interface EditTeamButtonProps {
    team: {
        id: number;
        name: string;
        flag_url: string | null;
        group_name: string | null;
    };
}

export default function EditTeamButton({ team }: EditTeamButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-[var(--color-neon-cyan)] text-white hover:text-black rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                title="Editar equipo"
            >
                <Pencil size={14} />
            </button>

            {isOpen && (
                <EditTeamModal 
                    team={team} 
                    onClose={() => setIsOpen(false)} 
                />
            )}
        </>
    );
}
