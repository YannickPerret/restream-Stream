import React from 'react';
import Input from '#components/_forms/Input';

const ControlPanel = ({ selectedElement, updateElement }) => {
    return (
        <div className="mt-8 w-full max-w-lg p-4 bg-gray-800 text-white rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
            <div className="mb-2">
                <Input
                    label="Font Size"
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement('fontSize', parseInt(e.target.value))}
                />
            </div>
            <div className="mb-2">
                <Input
                    label="Color"
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateElement('color', e.target.value)}
                />
            </div>
            <div className="mb-2">
                <Input
                    label="Position X"
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement('x', parseInt(e.target.value))}
                />
            </div>
            <div className="mb-2">
                <Input
                    label="Position Y"
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement('y', parseInt(e.target.value))}
                />
            </div>
        </div>
    );
};

export default ControlPanel;
