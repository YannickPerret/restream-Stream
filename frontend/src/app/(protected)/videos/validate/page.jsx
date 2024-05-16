'use client'
import {useEffect} from "react";
import {VideoApi} from "#api/video.js";
import {useVideoStore} from "#stores/useVideoStore.js";

export default function VideoValidatePage() {
    const videos = useVideoStore.use.videos()

    useEffect(() => {
        const fetchAllVideoValidate = async() => {
            const data = await VideoApi.getAll({status: 'pending'});
            console.log(data);
            useVideoStore.setState({videos: data});
        }
        fetchAllVideoValidate();
    }, []);

    return(
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Videos to validate</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>

                </header>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video) => (
                            <div key={video.id} className="bg-white rounded-lg shadow-lg">
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold">{video.title}</h2>
                                    <p className="text-sm text-gray-500">{video.description}</p>
                                    <div className="flex justify-end">
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Validate</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}