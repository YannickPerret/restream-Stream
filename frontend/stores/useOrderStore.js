import { create } from 'zustand';
import OrderApi from '#api/order.js';
import { useRouter } from 'next/navigation.js';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useOrderStore = createSelectors(create((set, get) => ({
    order: null,
    paymentIntent: null,
    setOrderData: (order, paymentIntent) => set({ order, paymentIntent }),
    clearOrderData: () => set({ order: null, paymentIntent: null }),
})))

export default useOrderStore;
