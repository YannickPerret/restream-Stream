import { create } from 'zustand';
import {StreamScheduleApi} from "#api/streamSchedule.js";


const useScheduleStreamStore = create((set) => ({
    streamSchedules: [],
    loading: false,
    error: null,

    fetchSchedules: async () => {
        set({ loading: true, error: null });
        try {
            const data = await StreamScheduleApi.getAll();
            set({ streamSchedules: data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch schedules', loading: false });
        }
    },
}));

export default useScheduleStreamStore;
