import { formatInTimeZone } from 'date-fns-tz';

const COLOMBIA_TZ = 'America/Bogota';

// Formatear hora de la BD para mostrar al usuario (UTC a UTC-5)
export function formatToColombiaTime(utcDateString: string): string {
    const date = new Date(utcDateString);
    return formatInTimeZone(date, COLOMBIA_TZ, 'dd MMM yyyy - hh:mm a') + ' (Hora Colombia)';
}

// Saber si el partido está bloqueado visualmente (regla de los 15 minutos)
export function isMatchLocked(kickoffUtcDate: string): boolean {
    const now = new Date();
    const kickoff = new Date(kickoffUtcDate);
    const diffInMinutes = (kickoff.getTime() - now.getTime()) / (1000 * 60);

    return diffInMinutes <= 15;
}

// Convertir UTC a string para input datetime-local en hora Colombia
export function getColombiaDatetimeLocal(utcDateString: string): string {
    if (!utcDateString) return '';
    const date = new Date(utcDateString);
    return formatInTimeZone(date, COLOMBIA_TZ, "yyyy-MM-dd'T'HH:mm");
}
// Formatear a fecha larga en español para encabezados (ej: "Martes, 15 de Junio")
export function formatToLongDate(utcDateString: string): string {
    const date = new Date(utcDateString);
    // Usamos el locale es-ES para nombres en español
    return formatInTimeZone(date, COLOMBIA_TZ, "EEEE, d 'de' MMMM", {
        // @ts-ignore - date-fns locale types can be tricky
        locale: require('date-fns/locale').es
    });
}

// Obtener solo la fecha (YYYY-MM-DD) en hora Colombia para usar como clave de agrupación
export function getColombiaISODate(utcDateString: string): string {
    const date = new Date(utcDateString);
    return formatInTimeZone(date, COLOMBIA_TZ, "yyyy-MM-dd");
}
