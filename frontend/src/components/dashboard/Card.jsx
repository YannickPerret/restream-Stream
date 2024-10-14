// components/Card.jsx
import React from 'react';

const DashboardCard = ({ title, children }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 text-black">
            {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
            {children}
        </div>
    );
};

export default DashboardCard;
