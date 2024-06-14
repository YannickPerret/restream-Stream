import { create } from "zustand";
import { TimelineApi } from "#api/timeline.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useTimelineStore = createSelectors(create((set, get) => ({
    timelines: [],
    selectedTimeline: null,

    fetchTimelines: async () => {
        try {
            const timelines = await TimelineApi.getAll();
            set({ timelines });
        } catch (error) {
            console.error("Failed to fetch timelines", error);
        }
    },

    fetchTimelineById: async (id) => {
        const existingTimeline = get().timelines.find((timeline) => timeline.id === id);
        if (existingTimeline) {
            set({ selectedTimeline: existingTimeline });
            return existingTimeline;
        }
        try {
            const timeline = await TimelineApi.getOne(id);
            set((state) => ({
                timelines: state.timelines.some((t) => t.id === timeline.id)
                    ? state.timelines.map((t) => (t.id === timeline.id ? timeline : t))
                    : [...state.timelines, timeline],
                selectedTimeline: timeline,
            }));
            return timeline;
        } catch (error) {
            console.error('Failed to fetch timeline', error);
            return null;
        }
    },

    createTimeline: async (data) => {
        try {
            const newTimeline = await TimelineApi.create(data);
            set((state) => ({ timelines: [...state.timelines, newTimeline] }));
        } catch (error) {
            console.error("Failed to create timeline", error);
        }
    },

    updateTimelineById: async (id, data) => {
        try {
            const updatedTimeline = await TimelineApi.update(id, data);
            set((state) => ({
                timelines: state.timelines.map((timeline) =>
                    timeline.id === id ? updatedTimeline : timeline
                ),
            }));
            if (get().selectedTimeline?.id === id) {
                set({ selectedTimeline: updatedTimeline });
            }
        } catch (error) {
            console.error("Failed to update timeline", error);
        }
    },

    deleteTimelineById: async (id) => {
        try {
            await TimelineApi.delete(id);
            set((state) => ({ timelines: state.timelines.filter((timeline) => timeline.id !== id) }));
        } catch (error) {
            console.error("Failed to delete timeline", error);
        }
    },
})));
