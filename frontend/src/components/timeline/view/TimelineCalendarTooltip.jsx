import React from 'react';

const TimelineCalendarTooltip = ({ content, position }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: position.y + 10, // Décalage par rapport à la position du curseur
                left: position.x + 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                zIndex: 101,
                whiteSpace: 'nowrap',
            }}
        >
            {content}
        </div>
    );
};

export default TimelineCalendarTooltip;
