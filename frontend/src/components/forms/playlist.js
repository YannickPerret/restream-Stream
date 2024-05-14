'use client';
import React, { useState, useEffect } from 'react';
import FormGroup from "@/components/forms/handleForm/formGroup";

export default function PlaylistForm({ title, isPublished, description, submitPlaylist }) {
    const [localTitle, setLocalTitle] = useState(title);
    const [localIsPublished, setLocalIsPublished] = useState(isPublished);
    const [localDescription, setLocalDescription] = useState(description);

    useEffect(() => {
        setLocalTitle(title);
        setLocalIsPublished(isPublished);
        setLocalDescription(description);
    }, [title, isPublished, description]);

    const handleSubmit = (e) => {
        e.preventDefault();
        submitPlaylist(localTitle, localDescription, localIsPublished);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormGroup>
                <label htmlFor="title">Playlist Title:</label>
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
            <button type="submit">Create Playlist</button>
        </form>
    );
};
