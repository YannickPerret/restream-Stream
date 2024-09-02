import React from 'react';

const Form = ({ children, onSubmit, onReset }) => {
    return (
        <form
            className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto"
            onSubmit={onSubmit}
            onReset={onReset}
        >
            {children}
        </form>
    );
};

export default Form;
