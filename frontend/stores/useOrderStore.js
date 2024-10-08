import { create } from 'zustand';
import OrderApi from '#api/order.js';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useOrderStore = createSelectors(create((set, get) => ({
    orders: null, // Store the current order

    setOrderData: (orderResponse) => {
        // Update the current order
        set({ orders: orderResponse });
    },

    clearOrderData: () => set({ orders: null }),

    fetchOrders: async () => {
        try {
            const orders = await OrderApi.getAll();
            set({ orders })
            return orders;
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    },
})))

export default useOrderStore;
