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
    guests: [],
    setGuests: (guests) => set({ guests }),
    removeGuest: (id) => set((state) => ({
        guests: state.guests.filter((guest) => guest.id !== id)
    })),
    updateGuest: (updatedGuest) => set((state) => ({
        guests: state.guests.map((guest) =>
            guest.id === updatedGuest.id ? updatedGuest : guest
        )
    })),
})));