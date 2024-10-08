'use client'
import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-300 py-4 text-stone-100">
            <button
                className="flex justify-between w-full text-left text-xl font-medium text-gray-100 hover:text-indigo-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {question}
                <span className="ml-4">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="mt-2 text-gray-200">{answer}</p>}
        </div>
    );
};

export default FAQItem;
