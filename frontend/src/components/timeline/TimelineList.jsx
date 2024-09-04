import React from 'react';
import TimelineItem from './TimelineItem';

const TimelineList = ({ timeline = [], removeVideo, moveVideo }) => {
    return (
        <div className="timeline-list">
            {timeline.map((item, index) => (
                <TimelineItem
                    key={index}
                    item={item}
                    onRemove={() => removeVideo(index)}
                    onMove={(direction) => {
                        const newIndex = direction === 'up' ? index - 1 : index + 1;
                        if (newIndex >= 0 && newIndex < timeline.length) {
                            moveVideo(index, newIndex);
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default TimelineList;
