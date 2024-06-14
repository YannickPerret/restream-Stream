import React from 'react';

const SimpleCardList = ({ title, items }) => {
    return (
        <div className="flex flex-col h-full max-h-[800px]">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div
                className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {items.map(item => (
                    <div key={item.id} className="mb-4">
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleCardList;
