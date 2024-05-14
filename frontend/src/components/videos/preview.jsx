import React from 'react';

const VideoPreview = ({ videoUrl }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <video controls className="max-w-full max-h-full">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview;