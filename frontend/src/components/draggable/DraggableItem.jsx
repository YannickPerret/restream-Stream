import React, { forwardRef } from 'react';

const DraggableItem = forwardRef(({ item, provided, snapshot, removeVideo }, ref) => (
    <li
        ref={ref}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`draggable-item flex gap-2 text-black p-4 mb-2 rounded ${snapshot.isDragging ? 'bg-gray-200 shadow-lg' : 'bg-white'}`}
        style={{ ...provided.draggableProps.style }}
    >
        <div>{item.title} - {item.duration}</div>
        <button onClick={() => removeVideo(item.key)}>Remove</button>
    </li>
));

export default DraggableItem;
