'use client'
import React from 'react';
import ReactGoogleAutocomplete from 'react-google-autocomplete';

const InputAddress = ({ label, onChange, formData }) => {
    const handlePlaceSelected = (place) => {
        const addressComponents = place.address_components;

        const extractComponent = (type) => {
            const component = addressComponents.find(component =>
                component.types.includes(type)
            );
            return component ? component.long_name : '';
        };

        // Extract street address (street_number + route)
        const streetNumber = extractComponent('street_number');
        const streetName = extractComponent('route');
        const streetAddress = `${streetName} ${streetNumber}`.trim();

        console.log(streetAddress)
        // Create the new updated address object
        const updatedFormData = {
            ...formData,
            address: streetAddress,
            city: extractComponent('locality'),
            state: extractComponent('administrative_area_level_1'),
            zip: extractComponent('postal_code'),
            country: extractComponent('country'),
        };

        // Call the onChange prop function to update the parent state
        onChange(updatedFormData);
    };

    return (
        <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
            <ReactGoogleAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API}
                onPlaceSelected={handlePlaceSelected}
                options={{
                    types: ["address"],
                }}
                language={"en"}
                placeholder="Enter your complete address"
                className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        </div>
    );
};

export default InputAddress;
