import {create} from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const useVideoStore = createSelectors(create((set) => ({
    videos: [],
    currentVideos: {}, // changed to store current video per stream
    subscriptions: [],
    addVideo: (video) => set((state) => ({ videos: [...state.videos, video] })),
    removeVideo: (videoId) => set((state) => ({ videos: state.videos.filter((v) => v.id !== videoId) })),
    setVideos: (videos) => set({ videos }),
    setCurrentVideo: ({ streamId, ...video }) => set((state) => ({
        currentVideos: { ...state.currentVideos, [streamId]: video }
    })),
    setSubscriptions: (subscriptions) => set({ subscriptions }),
    addSubscription: (subscription) => set((state) => ({ subscriptions: [...state.subscriptions, subscription] }))
})));