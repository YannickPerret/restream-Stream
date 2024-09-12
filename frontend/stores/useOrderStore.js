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
    orders: [], // Initialiser les commandes avec un tableau vide
    paymentIntent: null,
    setOrderData: (orders, paymentIntent) => set({ orders, paymentIntent }),
    clearOrderData: () => set({ orders: [], paymentIntent: null }),

    setOrders: (orders) => set({ orders }),

    fetchOrders: async () => {
        try {
            const orders = await OrderApi.getAll();
            console.log(orders)
            set({ orders })
            return orders;
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    },


})))

export default useOrderStore;
