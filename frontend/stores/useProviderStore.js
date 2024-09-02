import { create } from "zustand";
import { ProviderApi } from "#api/provider.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useProviderStore = createSelectors(create((set, get) => ({
    providers: [],
    selectedProvider: null,
    tokens: null,

    setProvider: (provider) => {
        set((state) => ({ providers: [...state.providers, provider] }));
    },

    setTokens: (tokens) => {
        set({ tokens });
    },

    fetchProviders: async () => {
        try {
            const providers = await ProviderApi.getAll();
            set({ providers });
        } catch (error) {
            console.error("Failed to fetch providers", error);
        }
    },

    fetchProviderById: async (id) => {
        const existingProvider = get().providers.find((provider) => provider.id === id);
        if (existingProvider) {
            set({ selectedProvider: existingProvider });
            return existingProvider;
        }
        try {
            const provider = await ProviderApi.getOne(id);
            set((state) => ({
                providers: state.providers.some((p) => p.id === provider.id)
                    ? state.providers.map((p) => (p.id === provider.id ? provider : p))
                    : [...state.providers, provider],
                selectedProvider: provider,
            }));
            return provider;
        } catch (error) {
            console.error('Failed to fetch provider', error);
            return null;
        }
    },

    createProvider: async (data) => {
        try {
            const newProvider = await ProviderApi.create(data);
            set((state) => ({ providers: [...state.providers, newProvider] }));
        } catch (error) {
            console.error("Failed to create provider", error);
        }
    },

    updateProviderById: async (id, data) => {
        try {
            const updatedProvider = await ProviderApi.update(id, data);
            set((state) => ({
                providers: state.providers.map((provider) =>
                    provider.id === id ? updatedProvider : provider
                ),
            }));
            if (get().selectedProvider?.id === id) {
                set({ selectedProvider: updatedProvider });
            }
        } catch (error) {
            console.error("Failed to update provider", error);
        }
    },

    deleteProviderById: async (id) => {
        try {
            await ProviderApi.delete(id);
            set((state) => ({ providers: state.providers.filter((provider) => provider.id !== id) }));
        } catch (error) {
            console.error("Failed to delete provider", error);
        }
    },
})));
