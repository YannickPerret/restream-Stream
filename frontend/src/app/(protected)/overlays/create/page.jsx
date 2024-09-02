'use client';

import React from 'react';
import Link from 'next/link';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Button from '#components/_forms/Button';
import CanvasOverlayEditor from "#components/overlays/CanvasOverlayEditor.jsx";

export default function OverlayCreatePage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic for handling the form submission
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a New Overlay</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <Link href="/overlays" className="text-white underline">Back to Overlays</Link>
                </div>
                <div className="p-6">
                    <Form onSubmit={handleSubmit}>
                        <FormGroup title="Overlay Details">
                            <CanvasOverlayEditor />
                        </FormGroup>

                        <div className="flex justify-end space-x-4 mt-4">
                            <Button type="reset" color="red" label="Reset" />
                            <Button type="submit" color="blue" label="Save Overlay" />
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}

