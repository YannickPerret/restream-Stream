'use client';
import { StreamApi } from '../../../../api/stream';
import StreamPageIndex from '../../../../views/streams';
import { useState, useEffect } from 'react';
import {useStreamStore} from "../../../../stores/useStreamStore";

const StreamsPage = () => {
    //const [streams, setStreams] = useState([]);

    useEffect(() => {
        const fetchStreams = async () => {
            const data = await StreamApi.getAll();
            //setStreams(data.streams);
            useStreamStore.setState({streams: data.streams});
        };

        fetchStreams();
    }, []);

    return (
        <div className="bg-white text-black">
            <h1>Your streams</h1>
            <StreamPageIndex />
        </div>
    );
};

export default StreamsPage;