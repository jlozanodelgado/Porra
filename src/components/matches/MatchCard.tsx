import React from 'react';
import { formatToColombiaTime, isMatchLocked } from '@/utils/date-helpers';
import { Lock, Clock } from 'lucide-react';

interface MatchCardProps {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeFlag: string;
    awayFlag: string;
    kickoffTime: string;
    homeGoalsReal?: number | null;
    awayGoalsReal?: number | null;
    status: string;
    prediction?: {
        homeGoals: number;
        awayGoals: number;
    };
}

export const MatchCard: React.FC<MatchCardProps> = ({
    id,
    homeTeam,
    awayTeam,
    homeFlag,
    awayFlag,
    kickoffTime,
    homeGoalsReal,
    awayGoalsReal,
    status,
    prediction
}) => {
    const locked = isMatchLocked(kickoffTime);
    const timeStr = formatToColombiaTime(kickoffTime);

    return (
        <div className="relative overflow-hidden bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center w-full max-w-md mx-auto transition-transform hover:scale-[1.02] h-full">
            {/* Glow effect */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--color-neon-green)] via-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] opacity-70"></div>

            <div className="flex justify-between w-full mb-4 items-center">
                <span className="text-xs font-semibold uppercase text-gray-400 font-heading tracking-widest bg-black/40 px-3 py-1 rounded-full">
                    Mundial 2026
                </span>
                {status === 'finished' ? (
                    <span className="text-xs font-bold text-white bg-[var(--color-neon-red)] px-2 py-1 rounded shadow-[0_0_8px_var(--color-neon-red)]">
                        FINAL
                    </span>
                ) : status === 'live' ? (
                    <span className="text-xs font-bold text-white bg-[var(--color-neon-green)] px-2 py-1 rounded shadow-[0_0_8px_var(--color-neon-green)] animate-pulse">
                        EN VIVO
                    </span>
                ) : locked ? (
                    <span className="text-xs font-bold text-gray-300 bg-gray-600/50 px-2 py-1 rounded flex items-center gap-1">
                        <Lock size={12} /> CERRADO
                    </span>
                ) : (
                    <span className="text-xs font-bold text-black bg-[var(--color-neon-green)] px-2 py-1 rounded shadow-[0_0_8px_var(--color-neon-green)] flex items-center gap-1">
                        <Clock size={12} /> ABIERTO
                    </span>
                )}
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden shadow-lg mb-2 bg-gray-800 shrink-0">
                        <img src={homeFlag || '/placeholder.png'} alt={homeTeam} className="object-cover w-full h-full" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-center line-clamp-1 w-full">{homeTeam}</span>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                    {status === 'finished' || status === 'live' ? (
                        <div className="flex items-center gap-3 text-4xl font-heading font-bold">
                            <span className="tabular-nums">{homeGoalsReal ?? 0}</span>
                            <span className="text-2xl text-gray-500 font-light">-</span>
                            <span className="tabular-nums">{awayGoalsReal ?? 0}</span>
                        </div>
                    ) : (
                        <div className="text-2xl font-heading font-bold text-gray-500 tracking-widest">
                            VS
                        </div>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden shadow-lg mb-2 bg-gray-800 shrink-0">
                        <img src={awayFlag || '/placeholder.png'} alt={awayTeam} className="object-cover w-full h-full" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-center line-clamp-1 w-full">{awayTeam}</span>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-center items-center">
                {prediction && (
                    <div className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/20 flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-widest font-black text-[var(--color-neon-cyan)] opacity-70">Tu Marcador:</span>
                        <div className="flex items-center gap-2 text-xl font-heading font-black text-white">
                            <span>{prediction.homeGoals}</span>
                            <span className="opacity-40">-</span>
                            <span>{prediction.awayGoals}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 w-full text-center text-sm font-body text-gray-400">
                {timeStr}
            </div>
        </div>
    );
};
