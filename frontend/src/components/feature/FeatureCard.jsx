import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="flex-shrink-0">
                <Icon className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-2 text-gray-400">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;
