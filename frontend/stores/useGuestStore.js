import {create} from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const useGuestStore = createSelectors(create((set) => ({
    Guests: [],
    addGuest: (guest) => set((state) => ({Guests: [...state.Guests, guest]})),
    removeGuest: (guest) => set((state) => ({Guests: state.Guests.filter((g) => g !== guest)})),
})));