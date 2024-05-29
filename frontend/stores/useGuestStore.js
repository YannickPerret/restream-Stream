import { create } from "zustand";
import { GuestApi } from "#api/guest.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useGuestStore = createSelectors(create((set, get) => ({
    guests: [],
    selectedGuest: null,

    fetchGuests: async () => {
        try {
            const guests = await GuestApi.getAll();
            set({ guests });
        } catch (error) {
            console.error("Failed to fetch guests", error);
        }
    },

    fetchGuestById: async (id) => {
        const existingGuest = get().guests.find((guest) => guest.id === id);
        if (existingGuest) {
            set({ selectedGuest: existingGuest });
            return existingGuest;
        }
        try {
            const guest = await GuestApi.getOne(id);
            set((state) => ({
                guests: state.guests.some((g) => g.id === guest.id)
                    ? state.guests.map((g) => (g.id === guest.id ? guest : g))
                    : [...state.guests, guest],
                selectedGuest: guest,
            }));
            return guest;
        } catch (error) {
            console.error('Failed to fetch guest', error);
            return null;
        }
    },

    createGuest: async (data) => {
        try {
            const newGuest = await GuestApi.create(data);
            set((state) => ({ guests: [...state.guests, newGuest] }));
        } catch (error) {
            console.error("Failed to create guest", error);
        }
    },

    updateGuestById: async (id, data) => {
        try {
            const updatedGuest = await GuestApi.update(id, data);
            set((state) => ({
                guests: state.guests.map((guest) =>
                    guest.id === id ? updatedGuest : guest
                ),
            }));
            if (get().selectedGuest?.id === id) {
                set({ selectedGuest: updatedGuest });
            }
        } catch (error) {
            console.error("Failed to update guest", error);
        }
    },

    deleteGuestById: async (id) => {
        try {
            await GuestApi.delete(id);
            set((state) => ({ guests: state.guests.filter((guest) => guest.id !== id) }));
        } catch (error) {
            console.error("Failed to delete guest", error);
        }
    },

    setSelectedGuest: (guest) => set({ selectedGuest: guest }),
    clearSelectedGuest: () => set({ selectedGuest: null }),
})));
