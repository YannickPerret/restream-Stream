import React, { useRef, useState, useEffect } from 'react';
import FileUpload from '#components/_forms/FileUpload';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import ControlPanel from "#components/overlays/ControlPanel.jsx";
import ElementList from "#components/overlays/ElementList.jsx";

const CanvasOverlayEditor = () => {
    const canvasRef = useRef(null);
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [resizingCorner, setResizingCorner] = useState(null);
    const [showControlPanel, setShowControlPanel] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        elements.forEach(element => {
            if (element.type === 'image') {
                const img = new Image();
                img.src = element.src;
                img.onload = () => {
                    ctx.drawImage(img, element.x, element.y, element.width, element.height);
                    if (selectedElement?.id === element.id) drawBorder(ctx, element);
                };
            }
        });
    }, [elements, selectedElement]);

    const drawBorder = (ctx, element) => {
        ctx.strokeStyle = 'violet';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        ctx.setLineDash([]);
    };

    const addElement = (type, content) => {
        const newElement = {
            id: Date.now(),
            type,
            x: 50,
            y: 50,
            width: content.width || 100,
            height: content.height || 50,
            fontSize: 20,
            color: 'black',
            zIndex: elements.length,
            ...content
        };
        setElements([...elements, newElement]);
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                addElement('image', { src: e.target.result, width: img.width / 2, height: img.height / 2 });
            };
        };
        reader.readAsDataURL(file);
    };

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const element = elements.find(el =>
            offsetX >= el.x && offsetX <= el.x + el.width &&
            offsetY >= el.y && offsetY <= el.y + el.height
        );
        if (element) {
            setSelectedElement(element);
            setShowControlPanel(true);

            const resizeHandleSize = 10;
            if (
                offsetX > element.x + element.width - resizeHandleSize &&
                offsetY > element.y + element.height - resizeHandleSize
            ) {
                setResizing(true);
                setResizingCorner('bottom-right');
            } else {
                setDragging(true);
            }
        } else {
            setSelectedElement(null);
            setShowControlPanel(false);
        }
    };

    const handleMouseMove = (e) => {
        if (dragging && selectedElement) {
            const { offsetX, offsetY } = e.nativeEvent;
            setElements(prevElements =>
                prevElements.map(el =>
                    el.id === selectedElement.id ? { ...el, x: offsetX - el.width / 2, y: offsetY - el.height / 2 } : el
                )
            );
        } else if (resizing && selectedElement) {
            const { offsetX, offsetY } = e.nativeEvent;
            if (resizingCorner === 'bottom-right') {
                const aspectRatio = selectedElement.width / selectedElement.height;
                const newWidth = offsetX - selectedElement.x;
                const newHeight = newWidth / aspectRatio;
                setElements(prevElements =>
                    prevElements.map(el =>
                        el.id === selectedElement.id
                            ? { ...el, width: newWidth, height: newHeight }
                            : el
                    )
                );
            }
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        setResizing(false);
        setResizingCorner(null);
    };

    const handleDoubleClick = (element) => {
        if (element.type === 'text') {
            setSelectedElement(element);
            const editableElement = document.getElementById(`text-element-${element.id}`);
            if (editableElement) {
                editableElement.contentEditable = true;
                editableElement.focus();
            }
        }
    };

    const handleTextChange = (e) => {
        if (selectedElement) {
            const updatedText = e.target.innerText;
            setElements(prevElements =>
                prevElements.map(el =>
                    el.id === selectedElement.id ? { ...el, text: updatedText } : el
                )
            );
        }
    };

    const handleBlur = (e) => {
        const element = e.target;
        element.contentEditable = false;
        setSelectedElement(null);
    };

    const exportAsPNG = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'overlay.png';
        link.click();
    };

    const updateSelectedElement = (key, value) => {
        if (selectedElement) {
            setElements(prevElements =>
                prevElements.map(el =>
                    el.id === selectedElement.id ? { ...el, [key]: value } : el
                )
            );
        }
    };

    const changeZIndex = (elementId, direction) => {
        const elementIndex = elements.findIndex(el => el.id === elementId);
        if (elementIndex < 0) return;

        const newElements = [...elements];
        const [movedElement] = newElements.splice(elementIndex, 1);

        if (direction === 'up') {
            newElements.splice(elementIndex + 1, 0, movedElement);
        } else if (direction === 'down') {
            newElements.splice(elementIndex - 1, 0, movedElement);
        }

        setElements(newElements);
    };

    const removeElement = (elementId) => {
        setElements(elements.filter(el => el.id !== elementId));
        setSelectedElement(null);
        setShowControlPanel(false);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ border: '1px solid black', cursor: 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
                {elements.map((element) =>
                    element.type === 'text' ? (
                        <div
                            key={element.id}
                            id={`text-element-${element.id}`}
                            style={{
                                position: 'absolute',
                                top: element.y,
                                left: element.x,
                                fontSize: `${element.fontSize}px`,
                                color: element.color,
                                cursor: 'move',
                                outline: 'none',
                                whiteSpace: 'nowrap',
                                border: selectedElement?.id === element.id ? '1px dashed violet' : 'none',
                                userSelect: 'none',
                                zIndex: element.zIndex
                            }}
                            onDoubleClick={() => handleDoubleClick(element)}
                            onInput={handleTextChange}
                            onBlur={handleBlur}
                        >
                            {element.text}
                        </div>
                    ) : null
                )}
            </div>
            <div className="flex space-x-4 mt-4">
                <Button
                    label="Add Text"
                    onClick={() => addElement('text', { text: 'Hello', fontSize: 20, color: 'black' })}
                    type="button"
                />
                <FileUpload
                    label="Upload Image"
                    description="PNG, JPG, GIF up to 10MB"
                    id="overlay-image-upload"
                    onChange={handleFileUpload}
                    accept={['image']}
                />
                <Button
                    label="Export as PNG"
                    onClick={exportAsPNG}
                    type="button"
                />
            </div>

            {showControlPanel && selectedElement?.type === 'text' && (
                <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
                    <div className="mb-2">
                        <Input
                            label="Font Size"
                            type="number"
                            value={selectedElement.fontSize}
                            onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="mb-2">
                        <Input
                            label="Color"
                            type="color"
                            value={selectedElement.color}
                            onChange={(e) => updateSelectedElement('color', e.target.value)}
                        />
                    </div>
                    <div className="mb-2">
                        <Input
                            label="Position X"
                            type="number"
                            value={selectedElement.x}
                            onChange={(e) => updateSelectedElement('x', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="mb-2">
                        <Input
                            label="Position Y"
                            type="number"
                            value={selectedElement.y}
                            onChange={(e) => updateSelectedElement('y', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {selectedElement && (
                <ControlPanel
                    selectedElement={selectedElement}
                    updateElement={updateSelectedElement}
                />
            )}
            <ElementList
                elements={elements}
                changeZIndex={changeZIndex}
                removeElement={removeElement}
            />
        </div>
    );
};

export default CanvasOverlayEditor;
