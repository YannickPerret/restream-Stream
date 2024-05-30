'use client';
import React, { useState, useEffect } from 'react';
import FormGroup from "#components/forms/handleForm/formGroup.jsx";
import Form from "#components/forms/handleForm/form.jsx";

export default function PlaylistForm({ title, isPublished, description, setTitle, setPublished, setDescription, submitPlaylist }) {
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
        <Form onSubmit={handleSubmit}>
            <FormGroup title="Create Playlist" type={"column"}>
                <FormGroup type={"row"}>
                    <label htmlFor="title">Playlist Title:</label>
                    <input id="title" value={localTitle} onChange={(e) => { setLocalTitle(e.target.value); setTitle(e.target.value); }} type="text" required />
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={localDescription} onChange={(e) => { setLocalDescription(e.target.value); setDescription(e.target.value); }} rows={3} cols={20}></textarea>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="isPublished">Published</label>
                    <input type="checkbox" id="isPublished" checked={localIsPublished} onChange={(e) => { setLocalIsPublished(e.target.checked); setPublished(e.target.checked); }} />
                </FormGroup>
            </FormGroup>

            <FormGroup title="Validations" type={"row"}>
                <button className="btn btn-success" type="submit">Create new Playlist</button>
            </FormGroup>
        </Form>
    );
};
