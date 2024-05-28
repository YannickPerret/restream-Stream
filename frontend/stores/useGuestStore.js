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
    selectedGuest: null,
    setGuests: (guests) => set({ guests }),
    removeGuest: (id) => set((state) => ({
        guests: state.guests.filter((guest) => guest.id !== id)
    })),
    updateGuest: (updatedGuest) => set((state) => ({
        guests: state.guests.map((guest) =>
            guest.id === updatedGuest.id ? updatedGuest : guest
        )
    })),
    findGuest: (id) => set((state) => ({
        selectedGuest: state.guests.find((guest) => guest.id === id)
    })),
    setSelectedGuest: (guest) => set({ selectedGuest: guest }),
    clearSelectedGuest: () => set({ selectedGuest: null }),
})));