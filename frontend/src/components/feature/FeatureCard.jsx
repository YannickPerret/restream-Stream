import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg flex items-center space-x-4 transition-transform duration-200 hover:scale-105 hover:bg-violet-800 hover:shadow-xl group">
            <div className="flex-shrink-0">
                <Icon className="h-16 w-16 text-indigo-500 transition-colors duration-200 " />
            </div>
            <div>
                <h3 className="text-lg font-medium transition-colors duration-200 group-hover:text-white">{title}</h3>
                <p className="mt-2 text-gray-400 transition-colors duration-200 group-hover:text-gray-200">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;
