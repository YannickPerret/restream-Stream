import {useStreamStore} from "../../../stores/useStreamStore";

export default function VideoIndexViews() {
    const videos = useStreamStore.use.videos();


  return (
    <table>
        <thead>
            <tr>
                <th>Id</th>
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
                    <td>{video.id}</td>
                    <td>{video.title}</td>
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