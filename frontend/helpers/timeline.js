export const generateTimeSlots = () => {
    const slots = [];
    let startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Start at midnight

    for (let i = 0; i < 48; i++) { // 48 slots of 30 minutes each
        slots.push(new Date(startTime));
        startTime.setMinutes(startTime.getMinutes() + 30); // Increment by 30 minutes
    }
    return slots;
};

export const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

export const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const getDayOfWeekInEnglish = (date) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];
};
