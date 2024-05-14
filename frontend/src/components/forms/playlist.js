'use client';
import React, { useState, useEffect } from 'react';
import FormGroup from "@/components/forms/handleForm/formGroup";

export default function PlaylistForm({ name, setName, isPublished, setPublished, description, setDescription, submitPlaylist }) {
    const [localName, setLocalName] = useState(name);
    const [localIsPublished, setLocalIsPublished] = useState(isPublished)
    const [localDescription, setLocalDescription] = useState(description)

    const handleSubmit = (e) => {
        e.preventDefault();
        submitPlaylist(localName);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormGroup>
                <label htmlFor="name">Playlist Name:</label>
                <input id="name" value={localName} onChange={(e) => setLocalName(e.target.value)} type="text" required/>
            </FormGroup>
            <FormGroup>
                <label htmlFor="description">Description</label>
                <textarea id={"description"} value={localDescription} onChange={setLocalDescription} rows={10}
                          cols={10}></textarea>
            </FormGroup>
            <FormGroup>
                <label htmlFor="isPublished">Published</label>
                <input type="checkbox" id={"isPublished"} value={localIsPublished}
                       onChange={(e) => setLocalIsPublished(e.target.checked)} />
            </FormGroup>


            <button type="submit">Create Playlist</button>
        </form>
    );
};