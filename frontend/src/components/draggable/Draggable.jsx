import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DraggableItem from './DraggableItem';

const DraggableList = ({ items, onListChange, removeVideo }) => {
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        onListChange(reorderedItems);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col"
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.key} draggableId={item.key} index={index}>
                                {(provided, snapshot) => (
                                    <DraggableItem
                                        ref={provided.innerRef}
                                        provided={provided}
                                        snapshot={snapshot}
                                        item={item}
                                        removeVideo={removeVideo}
                                    />
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DraggableList;
