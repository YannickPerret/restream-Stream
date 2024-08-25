import { create } from 'zustand';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useErrorStore = createSelectors(create((set) => ({
    error: {},
    setError: (type, message) => set({ type, message }),
    clearError: () => set({ error: null }),
})));

export default useErrorStore;
