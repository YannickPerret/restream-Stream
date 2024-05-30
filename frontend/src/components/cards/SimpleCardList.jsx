import React from 'react';
import VideoCardItem from './VideoCardItem';
import PlaylistCardItem from './PlaylistCardItem';

const SimpleCardList = ({ title, items }) => {
    return (
        <div className="flex flex-col h-full max-h-[400px]">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div
                className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {items.map((item) => (
                    item.type === 'video' ? (
                        <VideoCardItem key={item.id} video={item.video} addable={item.addable} add={item.add}/>
                    ) : (
                        <PlaylistCardItem key={item.id} playlist={item.playlist} addable={item.addable} add={item.add}/>
                    )
                ))}
            </div>
        </div>
    );
};

export default SimpleCardList;
