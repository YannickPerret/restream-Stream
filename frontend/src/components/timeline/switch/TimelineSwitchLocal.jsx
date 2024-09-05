import React from 'react';
import Dropdown from "#components/_forms/Dropdown.jsx";

const TimelineSwitchLocal = ({ locale, onChange }) => {
    const handleLocaleChange = (event) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex justify-start mb-4 pointer-events-auto z-20">
            <Dropdown
                label="Select Locale"
                options={[
                    {label: 'en-US', value: 'en-US'},
                    {label: 'fr-FR', value: 'fr-FR'},
                ]}
                value={locale}
                onChange={handleLocaleChange}
            />
        </div>
    );
};

export default TimelineSwitchLocal;
