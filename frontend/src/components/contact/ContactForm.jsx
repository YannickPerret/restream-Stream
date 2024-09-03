'use client'
import React, { useState } from 'react';
import Input from '#components/_forms/Input';
import Textarea from '#components/_forms/TextArea';
import Button from '#components/_forms/Button';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logique d'envoi des données du formulaire ici
        setSuccessMessage('Thank you for contacting us! We will get back to you soon.');
        // Réinitialiser le formulaire
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });
    };

    return (
        <div className="bg-gray-800 text-white py-44">
            <div className="container mx-auto max-w-6xl border-t border-b border-gray-50 py-12">
                <h2 className="text-4xl font-bold text-center mb-8">Contact Us</h2>
                <p className="text-xl text-gray-300 text-left mt-8 text-center">
                    Explore the powerful tools we provide to elevate your streaming experience.
                </p>
                {successMessage && (
                    <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
                        {successMessage}
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <FormGroup title="Your Information">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                        />
                    </FormGroup>

                    <FormGroup title="Message Details">
                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Enter the subject"
                        />
                        <Textarea
                            label="Message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your message"
                        />
                    </FormGroup>

                    <div className="flex justify-center">
                        <Button type="submit" label="Send Message"/>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ContactForm;
