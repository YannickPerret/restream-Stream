'use client'
import {StreamApi} from "../../../../api/stream";
import StreamPageIndex from "../../../../views/streams";
import {useEffect, useState} from "react";

const StreamsPage = () => {
    const [streams, setStreams] = useState([]);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const data = await StreamApi.getAll();
                setStreams(data.streams);
            } catch (error) {
                console.error("Error while fetching streams:", error);
            }
        };

        fetchStreams();
    }, []);

    return (
        <>
            <h1>Streams</h1>
            <StreamPageIndex streams={streams}/>
        </>
    )
}

export default StreamsPage;