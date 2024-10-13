import React from 'react';
import Dropdown from "#components/_forms/Dropdown.jsx";
import {useTimelineStore} from "#stores/useTimelineStore.js";

const TimelineSwitchLocal = ( ) => {
    const { locale, setLocale } = useTimelineStore();


    return (
        <Dropdown
            label="Select Locale"
            options={[
                {label: 'en-US', value: 'en-US'},
                {label: 'fr-FR', value: 'fr-FR'},
            ]}
            value={locale}
            onChange={(e) => {
                setLocale(e.target.value);
            }}
        />
    );
};

export default TimelineSwitchLocal;
