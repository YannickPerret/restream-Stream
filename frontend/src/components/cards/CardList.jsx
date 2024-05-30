import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import VideoCardItem from './VideoCardItem';
import PlaylistCardItem from './PlaylistCardItem';

const CardList = ({ title, items, onListChange }) => {
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        onListChange(reorderedItems);
    };

    return (
        <div className="flex flex-col h-full max-h-[800px]">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            {item.type === 'video' ? (
                                                <VideoCardItem video={item.video} number={index + 1} draggable remove={item.remove} />
                                            ) : (
                                                <PlaylistCardItem playlist={item.playlist} number={index + 1} draggable remove={item.remove} />
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default CardList;
