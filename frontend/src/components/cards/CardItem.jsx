import React from 'react';

const CardItem = React.forwardRef(({ title, number, description, duration, footer, provided }, ref) => (
    <div
        ref={ref}
        {...(provided ? provided.draggableProps : {})}
        {...(provided ? provided.dragHandleProps : {})}
        className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800"
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{title}</h3>
            {number !== null && <span className="text-gray-500 dark:text-gray-400">{number}</span>}
        </div>
        <div className="mb-4">
            {duration && <p className="text-sm text-gray-400 dark:text-gray-500">Duration: {duration}</p>}
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {footer && (
            <div className="flex justify-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">{footer}</span>
            </div>
        )}
    </div>
));

CardItem.displayName = 'CardItem';

export default React.memo(CardItem);
