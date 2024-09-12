'use client'
import React, { useState } from 'react';
import Input from '#components/_forms/Input';
import Textarea from '#components/_forms/TextArea';
import Button from '#components/_forms/Button';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Image from 'next/image';

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
        <div className="relative flex items-center justify-center min-h-screen">
            {/* SVG en arrière-plan */}
            <Image
                src="/background_motif.svg"
                alt="Background Motif"
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 z-0"
            />

            <div className="relative z-10 w-full max-w-6xl px-6 py-16 mx-auto bg-opacity-75 backdrop-blur-md rounded-lg">
                <h2 className="text-4xl font-bold text-center text-white mb-8">Let's Connect!</h2>
                <p className="text-lg text-center text-gray-300 mb-12">
                    Got a project idea or just want to say hi? Shoot me a message—let's make some tech magic happen!
                </p>
                {successMessage && (
                    <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
                        {successMessage}
                    </div>
                )}
                <Form onSubmit={handleSubmit} className="space-y-8">
                    {/* Champs Full Name et Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Champ Subject */}
                    <div className="grid grid-cols-1 gap-8">
                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Subject"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Champ Message */}
                    <div className="grid grid-cols-1 gap-8">
                        <Textarea
                            label="Message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Message Here"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Bouton d'envoi */}
                    <div className="flex justify-center mt-12">
                        <Button type="submit" label="Contact Us 👋" className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200" />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ContactForm;
