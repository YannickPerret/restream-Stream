import React from 'react';

const VideoPreview = ({ videoUrl }) => {
  return (
    <div className="flex justify-center items-center">
      <video controls className="w-96 h-auto" preload={"auto"}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview;