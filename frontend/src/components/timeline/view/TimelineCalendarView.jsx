import React, { useState } from 'react';
import { useTimelineStore } from '#stores/useTimelineStore';
import Dropdown from '#components/_forms/Dropdown';

const generateTimeSlots = () => {
    const slots = [];
    let startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Commence à minuit

    for (let i = 0; i < 48; i++) { // 48 slots de 30 minutes chacun
        slots.push(new Date(startTime));
        startTime.setMinutes(startTime.getMinutes() + 30); // Incrémente de 30 minutes
    }

    return slots;
};

const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste lorsque le jour est dimanche
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

const CalendarView = () => {
    const [locale, setLocale] = useState('en-US'); // Default locale
    const timeline = useTimelineStore.use.timelineItems();
    const calendarData = {};
    const now = new Date();
    const startOfWeek = getStartOfWeek(new Date(now)); // Obtenez le début de la semaine

    // Préparer les données du calendrier
    timeline.forEach(item => {
        let current = new Date(item.startTime);
        while (current < item.endTime) {
            const day = current.toLocaleDateString('en-US', { weekday: 'long' }); // Garder "en-US" pour comparaison
            const timeSlot = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // Garder "en-US" pour comparaison

            if (!calendarData[day]) {
                calendarData[day] = {};
            }

            if (!calendarData[day][timeSlot]) {
                calendarData[day][timeSlot] = [];
            }

            calendarData[day][timeSlot].push(item);

            current.setMinutes(current.getMinutes() + 30); // Aller au prochain créneau de 30 minutes
        }
    });

    const timeSlots = generateTimeSlots();

    const handleLocaleChange = (event) => {
        setLocale(event.target.value);
    };

    // Générer les jours de la semaine
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        return day.toLocaleDateString('en-US', { weekday: 'long' }); // Toujours afficher les jours en anglais
    });

    return (
        <div className="p-4">
            <div className="flex justify-start mb-4">
                <Dropdown
                    label="Select Locale"
                    options={[
                        { label: 'en-US', value: 'en-US' },
                        { label: 'fr-FR', value: 'fr-FR' },
                    ]}
                    value={locale}
                    onChange={handleLocaleChange}
                />
            </div>

            <div className="grid grid-cols-8 gap-0">
                <div className="col-span-1 mt-9">
                    {timeSlots.map((slot, index) => (
                        <div key={index} className="h-12 border-b border-gray-700 text-right pr-2 text-gray-400 flex items-center">
                            {slot.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    ))}
                </div>

                {daysOfWeek.map((day, i) => (
                    <div key={i} className="col-span-1 border-x">
                        <h3 className="text-lg font-bold text-white mb-2 text-center">{day}</h3>
                        <div className="space-y-0 relative">
                            {timeSlots.map((slot, index) => {
                                const isPast = slot < now && slot >= startOfWeek && slot.toLocaleDateString('en-US', { weekday: 'long' }) === day; // Garder "en-US" pour comparaison
                                const isNow = now >= slot && now < new Date(slot.getTime() + 30 * 60000) && slot.toLocaleDateString('en-US', { weekday: 'long' }) === day; // Garder "en-US" pour comparaison

                                return (
                                    <div
                                        key={index}
                                        className={`h-12 border-b border-gray-700 relative flex items-center ${isPast ? 'bg-gray-600' : ''}`}
                                    >
                                        {isNow && (
                                            <div className="absolute w-full h-0.5 bg-red-500 top-1/2 transform -translate-y-1/2"></div>
                                        )}
                                        {calendarData[day] && calendarData[day][slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })] ? (
                                            calendarData[day][slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })].map((item, i) => (
                                                <div key={i} className={`absolute top-0 left-0 right-0 p-2 ${isPast ? 'bg-gray-800 text-gray-400' : 'bg-gray-900 text-white'} rounded-md`}>
                                                    <p className="text-sm">{item.video.title}</p>
                                                </div>
                                            ))
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarView;
