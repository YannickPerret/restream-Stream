import {create} from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const useProviderStore = createSelectors(create((set) => ({
    providers : [],
    setProviders : (providers) => set({providers}),
    addProvider : (provider) => set((s) => ({providers : [...s.providers, provider]})),
    removeProvider : (provider) => set((s) => ({providers : s.providers.filter((p) => p !== provider)})),
    clearProviders : () => set({providers : []}),
    updateProvider : (provider) => set((s) => ({providers : s.providers.map((p) => p.id === provider.id ? provider : p)}))
})));