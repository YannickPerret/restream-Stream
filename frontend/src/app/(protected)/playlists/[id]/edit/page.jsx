'use client';
import React, { useEffect, useState } from 'react';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";
import PlaylistEditView from "@/views/playlists/edit.jsx";
import {useParams} from "next/navigation";
import {usePlaylistStore} from "#stores/usePlaylistStore.js";

export default function PlaylistsEditPage() {
  const { id } = useParams();
  const getVideos = useVideoStore.use.fetchVideos();
  const getPlaylist = usePlaylistStore.use.fetchPlaylistById();

  useEffect(() => {
    const fetchVideos = async () => {
        await getVideos();
        await getPlaylist(id);
    }
    fetchVideos();
  }, [id]);


  return (
      <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
          <div className="bg-slate-500">
              <div className="container mx-auto">
                  <h1 className="text-3xl text-white py-4 ">Edit the playlist</h1>
                  <hr className="border-b-1 border-blueGray-300 pb-6" />
                  <div>
                      <Link href={`/playlists/${id}`}>Back to the playlist</Link>
                      <Link href={"/playlists"}>Back to all Playlist</Link>
                  </div>
              </div>

              <PlaylistEditView />
            </div>
      </section>
  );
}