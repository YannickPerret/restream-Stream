import { create } from 'zustand'
import CartApi from '#api/cart';

const useCartStore = create((set, get) => ({
    cartItems: [],
    isLoading: false,
    error: null,
    showEmbeddedCart: false,

    // Fonction pour récupérer tous les articles du panier
    fetchCartItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await CartApi.getAll();
            set({ cartItems: data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fonction pour ajouter un article au panier
    addToCart: async (product) => {
        set({ isLoading: true, error: null });
        try {
            const newCartItem = await CartApi.create(product);
            set((state) => ({
                cartItems: [...state.cartItems, newCartItem],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fonction pour supprimer un article du panier
    removeFromCart: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await CartApi.delete(id);
            set((state) => ({
                cartItems: state.cartItems.filter((item) => item.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fonction pour mettre à jour la quantité d'un article dans le panier
    updateCartItem: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedItem = await CartApi.update(id, data);
            set((state) => ({
                cartItems: state.cartItems.map((item) => (item.id === id ? updatedItem : item)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fonction pour calculer le total du panier
    calculateCart: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    },

    // Fonction pour afficher ou masquer le panier intégré
    toggleEmbeddedCart: () => {
        set((state) => ({ showEmbeddedCart: !state.showEmbeddedCart }));
    }
}));

export default useCartStore;
