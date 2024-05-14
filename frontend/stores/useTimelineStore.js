import {create} from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const useTimelineStore = createSelectors(create((set) => ({
    //multiple streams
    timelines : [],
    setTimelines : (timelines) => set({timelines}),
    addTimeline : (timeline) => set((s) => ({timelines : [...s.timelines, timeline]})),
    removeTimeline : (timeline) => set((s) => ({timelines : s.timelines.filter((t) => t !== timeline)})),
    //single stream
    
})));