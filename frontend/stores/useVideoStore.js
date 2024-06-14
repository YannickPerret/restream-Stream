import { create } from "zustand";
import { VideoApi } from "#api/video.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useVideoStore = createSelectors(create((set, get) => ({
    videos: [],
    selectedVideo: null,

    fetchVideos: async (filters = {}) => {
        try {
            const videos = await VideoApi.getAll(filters);
            set({ videos });
        } catch (error) {
            console.error("Failed to fetch videos", error);
        }
    },

    fetchVideoById: async (id) => {
        try {
            const video = await VideoApi.getOne(id);
            set((state) => ({
                videos: state.videos.some((v) => v.id === video.id)
                    ? state.videos.map((v) => (v.id === video.id ? video : v))
                    : [...state.videos, video],
                selectedVideo: video,
            }));
            return video;
        } catch (error) {
            console.error('Failed to fetch video', error);
            return null;
        }
    },

    createVideo: async (data) => {
        try {
            const newVideo = await VideoApi.create(data);
            set((state) => ({ videos: [...state.videos, newVideo] }));
        } catch (error) {
            console.error("Failed to create video", error);
        }
    },

    updateVideoById: async (id, data) => {
        try {
            const updatedVideo = await VideoApi.update(id, data);
            set((state) => ({
                videos: state.videos.map((video) =>
                    video.id === id ? updatedVideo : video
                ),
                selectedVideo: state.selectedVideo?.id === id ? updatedVideo : state.selectedVideo,
            }));
        } catch (error) {
            console.error("Failed to update video", error);
        }
    },

    deleteVideoById: async (id) => {
        try {
            await VideoApi.delete(id);
            set((state) => ({
                videos: state.videos.filter((video) => video.id !== id),
                selectedVideo: state.selectedVideo?.id === id ? null : state.selectedVideo,
            }));
        } catch (error) {
            console.error("Failed to delete video", error);
        }
    },

    setVideos: (videos) => set({ videos }),

})));
