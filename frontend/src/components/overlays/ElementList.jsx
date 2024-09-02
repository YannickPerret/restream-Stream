import React from 'react';
import Button from '#components/_forms/Button';

const ElementList = ({ elements, changeZIndex, removeElement }) => {
    return (
        <div className="mt-8 w-full max-w-lg p-4 bg-gray-800 text-white rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Elements List</h3>
            {elements.map((el) => (
                <div key={el.id} className="mb-2 flex justify-between items-center">
                    <span>{el.type === 'text' ? el.text : 'Image'}</span>
                    <div className="flex space-x-2">
                        <Button label="Up" onClick={() => changeZIndex(el.id, 'up')} />
                        <Button label="Down" onClick={() => changeZIndex(el.id, 'down')} />
                        <Button label="Delete" onClick={() => removeElement(el.id)} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ElementList;
