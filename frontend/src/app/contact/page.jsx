'use client';
import React, { useState } from 'react';
import Panel from "#components/layout/panel/Panel.jsx";
import NewsletterApi from "#api/newsletter.js";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await NewsletterApi.create(formData);

            if (response.ok) {
                setSuccessMessage('Thank you for reaching out! We will get back to you soon.');
                setFormData({ name: '', email: '', message: '' });
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'Something went wrong. Please try again later.');
            }
        } catch (error) {
            setErrorMessage('Failed to send your message. Please try again later.');
        }
    };

    return (
        <Panel>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-6">
                <div className="max-w-lg w-full bg-white p-8 shadow-md rounded-lg">
                    <h2 className="text-3xl font-bold text-center mb-6">Contact Us</h2>
                    {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}
                    {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="email"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                rows="5"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition duration-200"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </Panel>

    );
};

export default ContactPage;