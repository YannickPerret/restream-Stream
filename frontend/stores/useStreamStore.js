import { create } from "zustand";
import { StreamApi } from "#api/stream.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useStreamStore = createSelectors(create((set, get) => ({
    streams: [],
    selectedStream: null,

    fetchStreams: async () => {
        try {
            const streams = await StreamApi.getAll();
            set({ streams });
        } catch (error) {
            console.error("Failed to fetch streams", error);
        }
    },

    fetchStreamById: async (id) => {
        const existingStream = get().streams.find((stream) => stream.id === id);
        if (existingStream) {
            set({ selectedStream: existingStream });
            return existingStream;
        }
        try {
            const stream = await StreamApi.getOne(id);
            set((state) => ({
                streams: state.streams.some((s) => s.id === stream.id)
                    ? state.streams.map((s) => (s.id === stream.id ? stream : s))
                    : [...state.streams, stream],
                selectedStream: stream,
            }));
            return stream;
        } catch (error) {
            console.error('Failed to fetch stream', error);
            return null;
        }
    },

    createStream: async (data) => {
        try {
            const newStream = await StreamApi.create(data);
            set((state) => ({ streams: [...state.streams, newStream] }));
        } catch (error) {
            console.error("Failed to create stream", error);
        }
    },

    updateStreamById: async (id, data) => {
        try {
            const updatedStream = await StreamApi.update(id, data);
            set((state) => ({
                streams: state.streams.map((stream) =>
                    stream.id === id ? { ...updatedStream, currentVideo: stream.currentVideo } : stream
                ),
            }));
            if (get().selectedStream?.id === id) {
                set({ selectedStream: updatedStream });
            }
        } catch (error) {
            console.error("Failed to update stream", error);
        }
    },

    deleteStreamById: async (id) => {
        try {
            await StreamApi.delete(id);
            set((state) => ({ streams: state.streams.filter((stream) => stream.id !== id) }));
        } catch (error) {
            console.error("Failed to delete stream", error);
        }
    },

    updateStreamStatus: (id, status) => set((state) => ({
        streams: state.streams.map(stream => stream.id === id ? { ...stream, status } : stream)
    })),

    updateCurrentVideo: (id, video) => set((state) => ({
        streams: state.streams.map(stream => stream.id === id ? { ...stream, currentVideo: video } : stream)
    })),

    updateStreamSelectedStatus: (status) => set({ selectedStream: { ...get().selectedStream, status } }),
})));
