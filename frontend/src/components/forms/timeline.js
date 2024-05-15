'use client';
import React, { useState, useEffect } from 'react';
import FormGroup from "@/components/forms/handleForm/formGroup";
import {VideoApi} from "#api/video.js";
import {useVideoStore} from "#stores/useVideoStore.js";
import {PlaylistApi} from "#api/playlist.js";
import {usePlaylistStore} from "#stores/usePlaylistStore.js";

export default function TimelineForm({ title, isPublished, description, submitTimeline }) {
    const [localTitle, setLocalTitle] = useState(title);
    const [localIsPublished, setLocalIsPublished] = useState(isPublished);
    const [localDescription, setLocalDescription] = useState(description);

    useEffect(() => {
        setLocalTitle(title);
        setLocalIsPublished(isPublished);
        setLocalDescription(description);
    }, [title, isPublished, description]);

    useEffect(() => {
        const fetchTimelineElements = async () => {
            const videos = await VideoApi.getAll();
            useVideoStore.setState({ videos });
            const playlists = await PlaylistApi.getAll();
            usePlaylistStore.setState({ playlists });
        };
        fetchTimelineElements();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        submitTimeline(localTitle, localDescription, localIsPublished);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormGroup>
                <label htmlFor="title">Timeline Title:</label>
                <input id="title" value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} type="text" required />
            </FormGroup>
            <FormGroup>
                <label htmlFor="description">Description:</label>
                <textarea id="description" value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} rows={3} cols={20}></textarea>
            </FormGroup>
            <FormGroup>
                <label htmlFor="isPublished">Published</label>
                <input type="checkbox" id="isPublished" checked={localIsPublished} onChange={(e) => setLocalIsPublished(e.target.checked)} />
            </FormGroup>
            <button type="submit">Create Timeline</button>
        </form>
    );
};
