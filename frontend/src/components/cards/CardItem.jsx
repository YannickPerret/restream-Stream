import React from 'react';

const CardItem = ({ title, number, description, duration, draggable, remove, add, addable, children }) => (
    <div className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{title}</h3>
            {number !== null && <span className="text-gray-500 dark:text-gray-400">{number}</span>}
        </div>
        <div className="mb-4">
            {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
            {duration && <p className="text-sm text-gray-400 dark:text-gray-500">Duration: {`${Math.floor(duration / 60)}m ${duration % 60}s`}</p>}
            {children}
        </div>
        {draggable && (
            <button onClick={remove} className="mt-2 bg-red-500 text-white py-1 px-2 rounded">Remove</button>
        )}
        {addable && (
            <button onClick={add} className="mt-2 bg-green-500 text-white py-1 px-2 rounded">Add</button>
        )}
    </div>
);

export default React.memo(CardItem);
