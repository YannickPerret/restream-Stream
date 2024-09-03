import { create } from 'zustand'
import ProductApi from "#api/product.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

const useProductStore = createSelectors(create((set, get) => ({
    products: [], // Liste des produits disponibles
    isLoading: false,

    // Fonction pour récupérer tous les produits depuis l'API
    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await ProductApi.getAll();
            set({ products: data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fonction pour récupérer un produit spécifique
    // Fonction pour récupérer un produit spécifique
    fetchProductById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const product = await ProductApi.getOne(id);
            const existingProducts = get().products;
            const updatedProducts = existingProducts.map(p => p.id === product.id ? product : p);
            if (!existingProducts.some(p => p.id === product.id)) {
                updatedProducts.push(product);
            }
            set({ products: updatedProducts, isLoading: false });
            return product;
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },
})))

export default useProductStore;