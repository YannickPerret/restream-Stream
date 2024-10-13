import { create } from "zustand";
import { TimelineApi } from "#api/timeline.js";
import { DateTime } from 'luxon';

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
    timelineItems: [],
    autoTransition: false,
    videoTransition: null,
    locale : 'en-US',
    newTimeline: {
        title: '',
        description: '',
        duration: 0,
        items: [],
    },

    setLocale: (locale) => set({ locale }),

    setNewTimeline: (key, value) => set((state) => ({
        newTimeline: {
            ...state.newTimeline,
            [key]: value,
        },
    })),

    clearNewTimeline: () => set({ newTimeline: { title: '', description: '', items: [] } }),

    clearNewTimelineItems: () => set((state) => ({
        newTimeline: {
            ...state.newTimeline,
            items: [],
            duration: 0,
        },
    })),

    addNewVideoInTimeline: (video) => {
        const currentItems = get().newTimeline.items;
        const autoTransition = get().autoTransition;
        const videoTransition = get().videoTransition;

        const newItems = [...currentItems, video];

        if (autoTransition && videoTransition) {
            const transitionVideo = {
                ...videoTransition,
                type: 'transition',
            };
            newItems.push(transitionVideo);
        }

        // Mise à jour du store
        set((state) => ({
            newTimeline: {
                ...state.newTimeline,
                items: newItems,
                duration: state.newTimeline.duration + video.duration + (autoTransition && videoTransition ? videoTransition.duration : 0),
            },
        }));
    },

    setAutoTransition: (value) => set({ autoTransition: value }),

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
            set({ selectedTimeline: existingTimeline, timelineItems: existingTimeline.items || [] });
            return existingTimeline;
        }
        try {
            const timeline = await TimelineApi.getOne(id);
            set((state) => ({
                timelines: state.timelines.some((t) => t.id === timeline.id)
                    ? state.timelines.map((t) => (t.id === timeline.id ? timeline : t))
                    : [...state.timelines, timeline],
                selectedTimeline: timeline,
                timelineItems: timeline.items || [],
            }));
            return timeline;
        } catch (error) {
            console.error('Failed to fetch timeline', error);
            return null;
        }
    },

    addVideoToTimeline: (video) => {
        const timelineItems = get().timelineItems;
        let startTime;

        if (timelineItems.length === 0) {
            // Si la timeline est vide, commencez à maintenant
            startTime = DateTime.now();
        } else {
            // Sinon, commencez à la fin de la dernière vidéo ajoutée
            const lastItem = timelineItems[timelineItems.length - 1];
            startTime = DateTime.fromISO(lastItem.endTime);
        }

        const endTime = startTime.plus({ minutes: video.duration });

        const newTimelineItem = {
            video,
            startTime: startTime.toISO(),
            endTime: endTime.toISO(),
        };

        set({ timelineItems: [...timelineItems, newTimelineItem] });

        if (get().addAutoTransition && get().videoTransition) {
            const transitionVideo = get().videoTransition;
            if (transitionVideo) {
                const transitionItem = {
                    video: transitionVideo,
                    startTime: endTime.toISO(),
                    endTime: endTime.plus({ minutes: transitionVideo.duration }).toISO(),
                };
                set({ timelineItems: [...get().timelineItems, transitionItem] });
            }
        }
    },

    addPlaylistToTimeline: (playlist) => {
        const timelineItems = get().timelineItems;
        let startTime;

        if (timelineItems.length === 0) {
            // Si la timeline est vide, commencez à maintenant
            startTime = DateTime.now();
        } else {
            // Sinon, commencez à la fin de la dernière vidéo ajoutée
            const lastItem = timelineItems[timelineItems.length - 1];
            startTime = DateTime.fromISO(lastItem.endTime);
        }

        playlist.videos.forEach((video) => {
            const endTime = startTime.plus({ minutes: video.duration });

            const newTimelineItem = {
                video,
                startTime: startTime.toISO(), // Conversion en ISO pour garder un format standardisé
                endTime: endTime.toISO(),
            };

            set((state) => ({
                timelineItems: [...state.timelineItems, newTimelineItem],
            }));

            // Mettre à jour startTime pour la prochaine vidéo
            startTime = endTime;
        });

        if (get().addAutoTransition && get().videoTransition) {
            const transitionVideo = get().videoTransition;
            if (transitionVideo) {
                const endTime = startTime.plus({ minutes: transitionVideo.duration });

                const transitionItem = {
                    video: transitionVideo,
                    startTime: startTime.toISO(),
                    endTime: endTime.toISO(),
                };

                set((state) => ({
                    timelineItems: [...state.timelineItems, transitionItem],
                }));
            }
        }
    },

    removeVideoFromTimeline: (index) => {
        const timelineItems = get().timelineItems;
        const newTimelineItems = [...timelineItems];
        newTimelineItems.splice(index, 1);
        set({ timelineItems: newTimelineItems });
    },

    moveVideoInTimeline: (fromIndex, toIndex) => {
        const timelineItems = get().newTimeline.items;
        const newTimelineItems = [...timelineItems];
        const [movedItem] = newTimelineItems.splice(fromIndex, 1);
        newTimelineItems.splice(toIndex, 0, movedItem);
        set({ newTimeline: { ...get().newTimeline, items: newTimelineItems } });
    },

    setVideoTransition: (video) => set({ videoTransition: video }),

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
    clearTimeline: () => set({ timelineItems: [] }),

    deleteTimelineById: async (id) => {
        try {
            await TimelineApi.delete(id);
            set((state) => ({
                timelines: state.timelines.filter((timeline) => timeline.id !== id),
                selectedTimeline: state.selectedTimeline?.id === id ? null : state.selectedTimeline,
                timelineItems: state.selectedTimeline?.id === id ? [] : state.timelineItems,
            }));
        } catch (error) {
            console.error("Failed to delete timeline", error);
        }
    },

})));
