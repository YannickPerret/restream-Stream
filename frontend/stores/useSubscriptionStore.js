import { create } from 'zustand'
import SubscriptionApi from '#api/subscription';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useSubscriptionStore = createSelectors(create((set, get) => ({
    subscriptions: [],
    isLoading: false,
    error: null,

    fetchSubscriptions: async () => {
        set({ isLoading: true, error: null });
        try {
            const subscriptions = await SubscriptionApi.getAll();
            set({ subscriptions, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addSubscription: async (data) => {
        try {
            const newSubscription = await SubscriptionApi.create(data);
            set((state) => ({ subscriptions: [...state.subscriptions, newSubscription] }));
        } catch (error) {
            set({ error: error.message });
        }
    },

    updateSubscription: async (id, data) => {
        try {
            const updatedSubscription = await SubscriptionApi.update(id, data);
            set((state) => ({
                subscriptions: state.subscriptions.map((subscription) =>
                    subscription.id === id ? updatedSubscription : subscription
                ),
            }));
        } catch (error) {
            set({ error: error.message });
        }
    },

    deleteSubscription: async (id) => {
        try {
            await SubscriptionApi.delete(id);
            set((state) => ({
                subscriptions: state.subscriptions.filter((subscription) => subscription.id !== id),
            }));
        } catch (error) {
            set({ error: error.message });
        }
    },
})))
