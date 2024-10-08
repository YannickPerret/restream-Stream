import { DateTime } from 'luxon';

export const calculateProratedPrice = (currentPrice, subscriptionStartDate, subscriptionEndDate, isMonthly) => {
    // Récupérer les dates de début et de fin de l'abonnement actuel
    const startDate = DateTime.fromISO(subscriptionStartDate);
    const endDate = DateTime.fromISO(subscriptionEndDate);
    const now = DateTime.now();

    // Calculer le nombre total de jours de la période d'abonnement
    const totalDays = endDate.diff(startDate, 'days').days;

    // Calculer le nombre de jours restants
    const remainingDays = endDate.diff(now, 'days').days;

    // Si la date actuelle dépasse la date de fin, il n'y a plus de temps restant
    if (remainingDays <= 0) {
        return currentPrice;  // Pas de prorata, l'abonnement est expiré
    }

    // Calculer la proportion du prix restant (prorata) selon les jours restants
    const proratedPrice = (remainingDays / totalDays) * currentPrice;

    // Si l'abonnement est mensuel, ajuster le prix
    if (isMonthly) {
        return proratedPrice.toFixed(2);  // Retourner le prix prorata arrondi
    } else {
        // Si l'abonnement est annuel, ajuster le prix pour l'année complète
        return proratedPrice.toFixed(2);
    }
};
