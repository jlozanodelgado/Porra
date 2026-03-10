/**
 * Calcula los puntos de un pronóstico basado en las reglas del ERS.
 * @param pHome - Goles pronosticados local
 * @param pAway - Goles pronosticados visitante
 * @param aHome - Goles reales local
 * @param aAway - Goles reales visitante
 * @param isPlayoff - Indica si es partido de segunda ronda
 * @returns - Puntos totales obtenidos
 */
export function calculatePoints(
    pHome: number,
    pAway: number,
    aHome: number,
    aAway: number,
    isPlayoff: boolean
): number {
    let points = 0;

    // Multiplicador: 1 para grupos, 2 para playoffs
    const multiplier = isPlayoff ? 2 : 1;

    // 1. Acertar goles locales
    if (pHome === aHome) points += 1 * multiplier;

    // 2. Acertar goles visitantes
    if (pAway === aAway) points += 1 * multiplier;

    // 3. Acertar resultado (Ganador o Empate)
    const predResult = pHome > pAway ? 'HOME' : pHome < pAway ? 'AWAY' : 'DRAW';
    const actualResult = aHome > aAway ? 'HOME' : aHome < aAway ? 'AWAY' : 'DRAW';

    if (predResult === actualResult) points += 1 * multiplier;

    // 4. Bono por marcador exacto
    if (pHome === aHome && pAway === aAway) {
        points += 2 * multiplier; // 2 puntos extra (Grupos) o 4 puntos extra (Playoffs)
    }

    return points;
}
