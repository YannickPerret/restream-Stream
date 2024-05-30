import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CardItem from './CardItem';

const CardList = ({ title, items, draggable, onListChange }) => {

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedIndexes = Array.from(items.map((_, index) => index));
        const [removed] = reorderedIndexes.splice(result.source.index, 1);
        reorderedIndexes.splice(result.destination.index, 0, removed);

        onListChange(reorderedIndexes);
    };

    return (
        <div className="h-[800px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {draggable ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4 p-4"
                            >
                                {items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                        {(provided) => (
                                            <CardItem
                                                ref={provided.innerRef}
                                                provided={provided}
                                                {...item}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <div className="space-y-4 p-4">
                    {items.map((item) => (
                        <CardItem key={item.id} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CardList;
