import React from 'react';

const TimelineItem = ({ item, onRemove, onMove }) => {
    return (
        <div className="timeline-item">
            <div className="item-content">
                <span>{item.video.title}</span>
                <button onClick={onRemove}>Remove</button>
            </div>
            <div className="item-controls">
                <button onClick={() => onMove('up')}>Move Up</button>
                <button onClick={() => onMove('down')}>Move Down</button>
            </div>
        </div>
    );
};

export default TimelineItem;
