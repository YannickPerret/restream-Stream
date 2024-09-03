import { create } from 'zustand';

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useCheckoutStore = createSelectors(create((set) => ({
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
    paymentData: null,
    isProcessing: false,
    paymentError: null,

    setFormData: (newData) =>
        set((state) => ({
            formData: { ...state.formData, ...newData },
        })),

    setPaymentData: (paymentData) =>
        set({
            paymentData,
        }),

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
