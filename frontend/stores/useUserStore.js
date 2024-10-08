import { create } from "zustand";
import UserApi from "#api/user.js";
import UserAdminApi from "#api/admin/user.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};

export const useUserStore = createSelectors(create((set, get) => ({
    users: [],
    loading: false,
    error:null,

    fetchAllUsers: async() => {
        set({ isLoading: true, error: null } );
        try {
            const data = await UserAdminApi.getAll()
            console.log(data)
            set({ users: data, loading: false });
        }
        catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchUsersById: async() => {
        set({ isLoading: true, error: null });
        try {
            const data = await UserApi.getOne(id);
            set({ users: data.users, loading: false });
        }
        catch (error) {
            set({ error: error.message, isLoading: false });
        }
    }

})));
