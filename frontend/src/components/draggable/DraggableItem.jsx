import React, { forwardRef } from 'react';

const DraggableItem = forwardRef(({ item, index, provided, snapshot, remove }, ref) => (
    <li
        ref={ref}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`draggable-item flex gap-2 text-black p-4 mb-2 rounded ${snapshot.isDragging ? 'bg-gray-200 shadow-lg' : 'bg-white'}`}
        style={{ ...provided.draggableProps.style }}
    >
        {item.type === 'video' ? (
            <div>
                {index + 1}. {item.video.title} - {item.video.duration} s
                <button onClick={() => remove(item.key)}>Remove</button>
            </div>
        ) : (
            <div>
                {index + 1}. {item.playlist.title} - {item.playlist.duration} s
                <button onClick={() => remove(item.key)}>Remove</button>
            </div>
        )}
    </li>
));

export default DraggableItem;
