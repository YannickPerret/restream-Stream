import StreamApi from "../../../../api/stream";
import StreamPageIndex from "../../../../pages/streams";

export default async function StreamsIndex() {
    const streams = await StreamApi.getAll();
    console.log("streams", streams)

    return (
        <>
            <h1>Streams</h1>
            <StreamPageIndex streams={streams} />

        </>
    )
}