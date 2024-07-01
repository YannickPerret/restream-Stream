'use client';
import {useTimelineStore} from "#stores/useTimelineStore.js";
import {getDurationInFormat} from "#helpers/time.js";
import Link from "next/link";
import {TimelineApi} from "#api/timeline.js";
import {useState} from "react";

export default function TimelinesShowView() {
    const timeline = useTimelineStore.use.selectedTimeline();
    const [changeTimelineFormat, setChangeTimelineFormat] = useState("");

    if (!timeline) {
        return <div className="text-center p-4">Loading...</div>
    }

    const handleGenerateNewTimeline = async () => {
        if (!changeTimelineFormat) {
            setChangeTimelineFormat("m3u8");
        }
        await TimelineApi.generateNewTimeline(timeline.id, changeTimelineFormat).then(() => {
            console.log("Timeline generated successfully")
        }
        ).catch((error) => {
            console.error("Error generating timeline", error)
        });
    }

    return (
        <div className="p-4 space-y-6">
            <div className="shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-2">Timeline name: {timeline.title}</h2>
                <p className="text-gray-950 mb-2">Timeline description: {timeline.description}</p>
                <p className="text-gray-950 mb-2">Timeline duration: {getDurationInFormat(timeline.duration)}</p>
                <p className="text-gray-950">Created by: {timeline.user.fullName}</p>
                <div className="mt-4">
                    <button onClick={() => handleGenerateNewTimeline()}
                            className="bg-blue-500 text-white py-2 px-4 rounded mt-4">Generate new timeline
                    </button>
                    <select onChange={(e) => setChangeTimelineFormat(e.target.value)} value={changeTimelineFormat}
                            className="mr-4">
                        <option value="m3u8">m3u8</option>
                        <option value="txt">txt</option>
                    </select>
                </div>
            </div>
            <div className="shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-4">Timeline Elements</h2>
                <div className="space-y-4">
                    {timeline.videos.map((item, index) => {
                        const isVideo = !item.videos;
                        return (
                            <div key={index} className="shadow-sm rounded p-4">
                                <h3 className="text-xl font-semibold mb-2">{index + 1}: {item.title}</h3>
                                <p className="text-gray-900 mb-2">description: {item.description}</p>
                                {isVideo ? (
                                    <>
                                        <p className="text-gray-900 mb-2">duration: {getDurationInFormat(item.duration)}</p>
                                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/videos/${item.id}/serve`} className="text-blue-500 hover:underline">Watch video</Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-900 mb-2">Number of videos: {item.videos.size}</p>
                                        <div className="space-y-4 mt-4">
                                            {item.videos.map((video, subIndex) => (
                                                <div key={subIndex} className="shadow-sm rounded p-4">
                                                    <h4 className="text-lg font-semibold mb-1">{subIndex + 1}: {video.title}</h4>
                                                    <p className="text-gray-900 mb-1">Video description: {video.description}</p>
                                                    <p className="text-gray-900 mb-1">Video duration: {getDurationInFormat(video.duration)}</p>
                                                    <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/videos/${video.id}/serve`} className="text-blue-500 hover:underline">Watch video</Link>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
