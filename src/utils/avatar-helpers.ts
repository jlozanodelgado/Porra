/**
 * Genera una URL de avatar aleatorio usando DiceBear para un usuario
 * @param seed Un identificador único (ej: nickname o user_id)
 * @returns URL del avatar SVG
 */
export function getRandomAvatar(seed: string): string {
    // Usamos el estilo 'avataaars' que es amigable y variado
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
