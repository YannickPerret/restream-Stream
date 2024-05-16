'use client';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";
import {VideoApi} from "#api/video.js";

export default function VideoIndexView() {
    const videos = useVideoStore.use.videos();

    const handleRemoveVideo = async (id) => {
        await VideoApi.delete(id).then(() => {
            useVideoStore.use.removeVideo(id);
        })
    }

  return (
    <table>
        <thead>
            <tr>
                <th>title</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Is Published</th>
                <th>Is show in live</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            {videos.map((video) => (
                <tr key={video.id}>
                    <td><Link href={`/videos/${video.id}`}>{video.title}</Link></td>
                    <td>{video.description}</td>
                    <td>{video.duration}</td>
                    <td>{video.isPublished ? 'Yes' : 'No'}</td>
                    <td>{video.showInLive ? 'Yes' : 'No'}</td>
                    <td>
                        <Link className="btn btn-success" href={`/videos/${video.id}/edit`}>Edit</Link>
                        <button className="btn btn-error" onClick={() => handleRemoveVideo(video.id)}>Delete</button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
  );
}