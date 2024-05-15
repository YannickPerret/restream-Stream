'use client';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";

export default function VideoIndexView() {
    const videos = useVideoStore.use.videos();

  return (
    <table>
        <thead>
            <tr>
                <th>title</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Is Published</th>
                <th>Is show in live</th>
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
                </tr>
            ))}
        </tbody>
    </table>
  );
}