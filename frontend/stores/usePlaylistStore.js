import {create} from "zustand";

const createSelectors = (_store) => {
    let store = _store;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }
    return store;
};


export const usePlaylistStore = createSelectors(create((set) => ({
    playlists: [],
    setPlaylists: (playlists) => set({ playlists }),
    addPlaylist: (playlist) => set(state => ({ playlists: [...state.playlists, playlist] })),
    removePlaylist: (id) => set(state => ({ playlists: state.playlists.filter(playlist => playlist.id !== id) })),
    updatePlaylist: (updatedPlaylist) => set(state => ({
        playlists: state.playlists.map(playlist => playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist)
    })),
    getPlaylist: (id) => state => state.playlists.find(playlist => playlist.id === id),
    setPlaylist: (id, newPlaylist) => set(state => ({
        playlists: state.playlists.map(playlist => playlist.id === id ? newPlaylist : playlist)
    })),
    /* custom function*/
    updatePlaylistStatus: (id, status) => set(state => ({
        playlists: state.playlists.map(playlist => playlist.id === id ? { ...playlist, status } : playlist)
    })),
})));