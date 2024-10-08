import { create } from 'zustand';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useCheckoutStore = createSelectors(create((set, get) => ({
    formData: {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country:'',
        phone:'',
    },
    creditCard: null,
    paymentData: null,
    isProcessing: false,
    paymentError: null,
    isMonthly: true,
    discounts: [], // Stocke les réductions appliquées
    discountError: null,

    setFormData: (key, value) =>
        set((state) => ({
            formData: {
                ...state.formData,
                [key]: value,
            },
        })),

    setCreditCard: (creditCard) => set({ creditCard }),
    setIsMonthly: (isMonthly) => set({ isMonthly }),

    clearDiscounts: () => set({ discounts: [], discountError: null }),

    getDiscounts: () => get().discounts,

    setIsProcessing: (isProcessing) =>
        set({
            isProcessing,
        }),

    setPaymentError: (paymentError) =>
        set({
            paymentError,
        }),
})));

export default useCheckoutStore;
