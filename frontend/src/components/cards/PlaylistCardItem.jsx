import React from 'react';
import CardItem from './CardItem';

const PlaylistCardItem = ({ playlist, number, draggable, remove, add, addable }) => {
    if (!playlist) return null;
    return (
        <CardItem
            title={playlist.title}
            number={number}
            draggable={draggable}
            remove={remove}
            add={add}
            addable={addable}
        >
            <p className="text-gray-500 dark:text-gray-400">{`Contains ${playlist.videos.length} videos`}</p>
        </CardItem>
    );
};

export default PlaylistCardItem;