import React from 'react';

const TimelineCalendarEvent = ({ item, dayColumnPositions, daysOfWeek, handleItemClick }) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);

    const getDayIndex = (date) => {
        const startOfWeek = daysOfWeek[0];
        const diff = date - startOfWeek;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const startDayIndex = getDayIndex(startTime);
    const endDayIndex = getDayIndex(endTime);

    const startTimeInMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endTimeInMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    // Calcul de la position pour le jour de début
    const startPosition = {
        top: `${startTimeInMinutes}px`,
        left: `${dayColumnPositions[startDayIndex]?.left || 0}px`,
        width: `${dayColumnPositions[startDayIndex]?.width || 0}px`,
    };

    // Calcul de la hauteur pour la première partie (jusqu'à minuit)
    const heightFirstPart = (24 * 60 - startTimeInMinutes) * 2; // Jusqu'à minuit

    // Calcul de la hauteur pour la deuxième partie (de minuit au endTime)
    const heightSecondPart = endTimeInMinutes * 2; // De minuit à la fin

    // Si l'événement ne dépasse pas minuit
    if (startDayIndex === endDayIndex) {
        const height = `${(endTimeInMinutes - startTimeInMinutes) * 2}px`; // Ajustez la hauteur en fonction de la durée

        return (
            <div
                className="absolute bg-blue-500 text-white p-2 rounded"
                style={{ ...startPosition, height }}
                onClick={handleItemClick}
            >
                {item.video.title}
            </div>
        );
    } else {
        // Si l'événement dépasse minuit
        return (
            <>
                {/* Première partie - du début à minuit */}
                <div
                    className="absolute bg-blue-500 text-white p-2 rounded"
                    style={{ ...startPosition, height: `${heightFirstPart}px` }}
                    onClick={handleItemClick}
                >
                    {item.video.title}
                </div>

                {/* Deuxième partie - de minuit au endTime du jour suivant */}
                {startDayIndex + 1 < daysOfWeek.length && (
                    <div
                        className="absolute bg-blue-500 text-white p-2 rounded"
                        style={{
                            top: `0px`,
                            left: `${dayColumnPositions[startDayIndex + 1]?.left || 0}px`,
                            width: `${dayColumnPositions[startDayIndex + 1]?.width || 0}px`,
                            height: `${heightSecondPart}px`,
                        }}
                        onClick={handleItemClick}
                    >
                        {item.video.title}
                    </div>
                )}
            </>
        );
    }
};

export default TimelineCalendarEvent;
