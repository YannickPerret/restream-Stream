'use client'
import React, { useState } from 'react';
import Input from '#components/_forms/Input';
import Textarea from '#components/_forms/TextArea';
import Button from '#components/_forms/Button';
import Form from '#components/_forms/Form';
import Image from 'next/image';
import ContactApi from "#api/contact.js";

const ContactForm = () => {
    // États individuels pour chaque champ d'entrée
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = { name, email, subject, message };

        try {
            const contactApi = await ContactApi.send(formData);
            if (!contactApi.ok) {
                setSuccessMessage('Thank you for contacting us! We will get back to you soon.');
            }
            // Réinitialiser les champs du formulaire
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error(error);
        }
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

                <Form onSubmit={handleSubmit} className="space-y-8">
                    {successMessage && (
                        <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
                            {successMessage}
                        </div>
                    )}
                    {/* Champs Full Name et Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Full Name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Champ Subject */}
                    <div className="grid grid-cols-1 gap-8">
                        <Input
                            label="Subject"
                            name="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Champ Message */}
                    <div className="grid grid-cols-1 gap-8">
                        <Textarea
                            label="Message"
                            name="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message Here"
                            className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white"
                        />
                    </div>

                    {/* Bouton d'envoi */}
                    <div className="flex justify-center mt-12">
                        <Button
                            type="submit"
                            label="Contact Us 👋"
                            className="bg-sky-600 text-white py-3 px-6 rounded-lg hover:bg-sky-700 transition duration-200"
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ContactForm;
