import { create } from 'zustand';
import DiscountApi from '#api/discount';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useDiscountStore = createSelectors(create((set, get) => ({
    discount: null, // Stocke le discount appliqué
    error: null, // Stocke les erreurs lors de l'application du discount

    setDiscount: (discount) => set({ discount }),
    clearDiscount: () => set({ discount: null }),

    applyDiscount: async (discountCode) => {
        try {
            const discount = await DiscountApi.apply({ discountCode });
            set({ discount });
            return discount;
        } catch (error) {
            console.error("Failed to apply discount", error);
            set({ error: 'Invalid discount code' });
            return null;
        }
    },
})));

export default useDiscountStore;
