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
    selectedSubscription: null, // Add selectedSubscription state
    isLoading: false,
    error: null,

    // Fetch all subscriptions
    fetchSubscriptions: async () => {
        set({ isLoading: true, error: null });
        try {
            const subscriptions = await SubscriptionApi.getAll();
            set({ subscriptions, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fetch subscription by ID and set it as selected
    fetchSubscriptionById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const subscription = await SubscriptionApi.getOne(id);
            const existingSubscriptions = get().subscriptions;
            const updatedSubscriptions = existingSubscriptions.map(sub => sub.id === subscription.id ? subscription : sub);
            if (!existingSubscriptions.some(sub => sub.id === subscription.id)) {
                updatedSubscriptions.push(subscription);
            }
            set({ subscriptions: updatedSubscriptions, selectedSubscription: subscription, isLoading: false }); // Set the selectedSubscription
            return subscription;
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Set selected subscription manually (can be used to clear selection or set directly)
    setSelectedSubscription: (subscription) => {
        set({ selectedSubscription: subscription });
    },

    // Fetch subscriptions by filters
    fetchSubscriptionsByFilter: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const subscriptions = await SubscriptionApi.getByFilter(filters);
            set({ subscriptions, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Add a new subscription
    addSubscription: async (data) => {
        try {
            const newSubscription = await SubscriptionApi.create(data);
            set((state) => ({ subscriptions: [...state.subscriptions, newSubscription] }));
        } catch (error) {
            set({ error: error.message });
        }
    },

    // Update an existing subscription
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

    // Delete a subscription
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
})));

export default useSubscriptionStore;
