import { formatInTimeZone } from 'date-fns-tz';

const COLOMBIA_TZ = 'America/Bogota';

// Formatear hora de la BD para mostrar al usuario (UTC a UTC-5)
export function formatToColombiaTime(utcDateString: string): string {
    const date = new Date(utcDateString);
    return formatInTimeZone(date, COLOMBIA_TZ, 'dd MMM yyyy - hh:mm a');
}

// Saber si el partido está bloqueado visualmente (regla de los 15 minutos)
export function isMatchLocked(kickoffUtcDate: string): boolean {
    const now = new Date();
    const kickoff = new Date(kickoffUtcDate);
    const diffInMinutes = (kickoff.getTime() - now.getTime()) / (1000 * 60);

    return diffInMinutes <= 15;
}
