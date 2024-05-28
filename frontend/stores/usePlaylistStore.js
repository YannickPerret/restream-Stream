import {create} from "zustand";
import {PlaylistApi} from "#api/playlist.js";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const usePlaylistStore = createSelectors(create((set, get) => ({
    playlists: [],
    selectedPlaylist: null,

    fetchPlaylists: async () => {
        try {
            const playlists = await PlaylistApi.getAll();
            set({ playlists });
        } catch (error) {
            console.error("Failed to fetch playlists", error);
        }
    },

    fetchPlaylistById: async (id) => {
        const existingPlaylist = get().playlists.find((playlist) => playlist.id === id);
        if (existingPlaylist) {
            set({ selectedPlaylist: existingPlaylist });
            return existingPlaylist;
        }
        try {
            const playlist = await PlaylistApi.getOne(id);
            set((state) => ({
                playlists: state.playlists.some((pl) => pl.id === playlist.id)
                    ? state.playlists.map((pl) => (pl.id === playlist.id ? playlist : pl))
                    : [...state.playlists, playlist],
                selectedPlaylist: playlist,
            }));
            return playlist;
        } catch (error) {
            console.error('Erreur lors de la récupération de la playlist', error);
            return null;
        }
    },
    createPlaylist: async (data) => {
        try {
            const newPlaylist = await PlaylistApi.create(data);
            set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
        } catch (error) {
            console.error("Failed to create playlist", error);
        }
    },

    updatePlaylistById: async (id, data) => {
        try {
            const updatedPlaylist = await PlaylistApi.update(id, data);
            set((state) => ({
                playlists: state.playlists.map((playlist) =>
                    playlist.id === id ? updatedPlaylist : playlist
                ),
            }));
            if (get().selectedPlaylist?.id === id) {
                set({ selectedPlaylist: updatedPlaylist });
            }
        } catch (error) {
            console.error("Failed to update playlist", error);
        }
    },

    deletePlaylistById: async (id) => {
        try {
            await PlaylistApi.delete(id);
            set((state) => ({ playlists: state.playlists.filter((playlist) => playlist.id !== id) }));
        } catch (error) {
            console.error("Failed to delete playlist", error);
        }
    },
})));