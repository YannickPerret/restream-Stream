'use client'
import React, {useState} from 'react'
import {StreamApi} from "../../api/stream";
export default function StreamForm({onSubmit}) {
    const [title, setTitle] = useState('')
    const [provider, setProvider] = useState('ffmpeg')

    const handleSubmit = async () => {
        await StreamApi.create({title, provider});
    }

    return(
        <form onSubmit={handleSubmit}>
            <label>
                Title
            </label>
            <input type="text" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <label>
                Provider
            </label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="ffmpeg">FFMPEG</option>
                <option value="gstreamer">GStreamer</option>
            </select>

            <button>Submit</button>
        </form>
    )
}