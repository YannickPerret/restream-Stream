class VideoFormatter {
    /**
     * Formate la taille donnée en Mo (Mégaoctets) vers la bonne unité (Go ou To).
     * @param {number} sizeInMB - Taille en Mo.
     * @returns {string} Taille formatée avec l'unité (Go ou To).
     */
    static formatSize(sizeInMB) {
        if (sizeInMB >= 1024 * 1024) {
            // Convertir en To (Téraoctets)
            const sizeInTB = sizeInMB / (1024 * 1024);
            return `${sizeInTB.toFixed(0)} To`;
        } else if (sizeInMB >= 1024) {
            // Convertir en Go (Gigaoctets)
            const sizeInGB = sizeInMB / 1024;
            return `${sizeInGB.toFixed(0)} Go`;
        } else {
            // Retourner en Mo si la taille est inférieure à 1024 Mo
            return `${sizeInMB.toFixed(0)} Mo`;
        }
    }
}

export default VideoFormatter;
