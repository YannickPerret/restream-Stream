import React from 'react';

const CardItem = React.forwardRef(({ item, number, provided, remove, add, draggable, addable }, ref) => (
    <div
        ref={ref}
        {...(provided ? provided.draggableProps : {})}
        {...(provided ? provided.dragHandleProps : {})}
        className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800"
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{item.title}</h3>
            {number !== null && <span className="text-gray-500 dark:text-gray-400">{number}</span>}
        </div>
        <div className="mb-4">
            {item.duration && <p className="text-sm text-gray-400 dark:text-gray-500">Duration: {item.duration}</p>}
            <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
        </div>
        {item.footer && (
            <div className="flex justify-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.footer}</span>
            </div>
        )}
        {draggable && (
            <button onClick={remove} className="mt-2 bg-red-500 text-white py-1 px-2 rounded">Remove</button>
        )}
        {addable && (
            <button onClick={add} className="mt-2 bg-green-500 text-white py-1 px-2 rounded">Add</button>
        )}
    </div>
));

CardItem.displayName = 'CardItem';

export default React.memo(CardItem);
