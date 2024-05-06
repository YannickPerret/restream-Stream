'use client';
import { StreamApi } from '../../../../api/stream';
import StreamPageIndex from '../../../../views/streams';
import { useState, useEffect } from 'react';
import {useStreamStore} from "../../../../stores/useStreamStore";

const StreamsPage = () => {

    useEffect(() => {
        const fetchStreams = async () => {
            const data = await StreamApi.getAll();
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