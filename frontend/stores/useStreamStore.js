import { create } from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useStreamStore = createSelectors(create((set) => ({
    streams: [],
    setStreams: (streams) => set({ streams }),
    addStream: (stream) => set(state => ({ streams: [...state.streams, { ...stream, currentVideo: null }] })),
    removeStream: (id) => set(state => ({ streams: state.streams.filter(stream => stream.id !== id) })),
    updateStream: (updatedStream) => set(state => ({
        streams: state.streams.map(stream => stream.id === updatedStream.id ? { ...updatedStream, currentVideo: stream.currentVideo } : stream)
    })),
    getStream: (id) => state => state.streams.find(stream => stream.id === id),
    setStream: (id, newStream) => set(state => ({
        streams: state.streams.map(stream => stream.id === id ? { ...newStream, currentVideo: stream.currentVideo } : stream)
    })),
    updateStreamStatus: (id, status) => set(state => ({
        streams: state.streams.map(stream => stream.id === id ? { ...stream, status } : stream)
    })),
    updateCurrentVideo: (id, video) => set(state => ({
        streams: state.streams.map(stream => stream.id === id ? { ...stream, currentVideo: video } : stream)
    })),
    subscriptions: [],
    setSubscriptions: (subscriptions) => set({ subscriptions }),
    addSubscription: (id, subscription) => set(state => ({ subscriptions: [...state.subscriptions, { id, subscription }] }))
})));
