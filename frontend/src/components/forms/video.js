'use client'
import {useState} from "react";
import {VideoApi} from "../../../api/video";

export default function VideoCreateForm({ setVideoFile }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [video, setVideo] = useState('')
    const [isPublished, setIsPublished] = useState(true)
    const [showInLive, setShowInLive] = useState(true)

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoFile(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video', video);
        formData.append('isPublished', isPublished ? 1 : 0);
        formData.append('showInLive', showInLive ? 1 : 0);

        await VideoApi.create(formData).then((response) => {
            console.log(response);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" onChange={(e) => setTitle(e.target.value)} value={title}/>
            </div>
            <div>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" onChange={(e) => setDescription(e.target.value)}
                          value={description}/>
            </div>
            <div>
                <label htmlFor="video">Video</label>
                <input type="file" id="video" name="video" onChange={handleFileChange}/>
            </div>

            <div>
                <label htmlFor="isPublished">Is Published</label>
                <input type="checkbox" id="isPublished" name="isPublished"
                       onChange={(e) => setIsPublished(e.target.checked)} checked={isPublished}/>
            </div>
            <div>
                <label htmlFor="showInLive">Show In Live</label>
                <input type="checkbox" id="showInLive" name="showInLive"
                       onChange={(e) => setShowInLive(e.target.checked)} checked={showInLive}/>
            </div>
            <button type="submit">Create</button>
        </form>
    )
}