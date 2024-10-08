// frontend/src/components/shop/CheckoutForm.jsx
'use client'
import React, { useEffect, useRef, useState } from "react";
import Form from "#components/_forms/Form.jsx";
import FormGroup from "#components/_forms/FormGroup.jsx";
import Input from "#components/_forms/Input.jsx";
import Button from "#components/_forms/Button.jsx";
import InputAddress from "#components/_forms/InputAddress.jsx";
import useCheckoutStore from "#stores/useCheckoutStore.js";
import { useAuthStore } from "#stores/useAuthStore.js";
import StripeCardForm from "#components/shop/creditCard/CreditCart.jsx";

export const CheckoutForm = ({ handleSubmit }) => {
    const { formData, setFormData, isProcessing, setPaymentError } = useCheckoutStore();
    const { user } = useAuthStore();
    const stripeCardFormRef = useRef(null);

    useEffect(() => {
        if (user && user.email) {
            setFormData('email', user.email);
        }
    }, [user, setFormData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(name, value);
    };

    const handleAddressChange = (updatedFormData) => {
        setFormData('address', updatedFormData.address);
        setFormData('city', updatedFormData.city);
        setFormData('state', updatedFormData.state);
        setFormData('zip', updatedFormData.zip);
        setFormData('country', updatedFormData.country);
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();

        if (stripeCardFormRef.current) {
            const cardPaymentMethod = await stripeCardFormRef.current.handleCardDetails();
            if (!cardPaymentMethod) return;

            handleSubmit(cardPaymentMethod.id);
        } else {
            setPaymentError('Unable to process payment at this time.');
        }
    };

    return (
        <Form onSubmit={onFormSubmit}>
            <FormGroup title="Personal Information">
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email address"
                    disabled={true}
                    required={true}
                />

                <FormGroup type={"row"}>
                    <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your firstname"
                        required={true}
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your lastname"
                        required={true}
                    />
                </FormGroup>

                <Input
                    label="Phone Number (optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                />
            </FormGroup>

            <FormGroup title="Billing Address">
                {formData.address.length <= 0 ? (
                    <InputAddress
                        label="Address complete"
                        onChange={handleAddressChange}
                        formData={{ address: formData.address, city: formData.city, state: formData.state, zip: formData.zip, country: formData.country }}
                    />
                ) : (
                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={(e) => setFormData('address', e.target.value)}
                        placeholder="Enter your address"
                        required={true}
                    />
                )}

                <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required={true}
                />

                <FormGroup type={"row"}>
                    <Input
                        label="ZIP/Postal Code"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="Enter your ZIP/postal code"
                        required={true}
                    />

                    <Input
                        label="State/Province"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter your state/province"
                        required={true}
                    />
                </FormGroup>

                <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country"
                    required={true}
                />
            </FormGroup>

            <FormGroup title="Payment Information">
                <StripeCardForm ref={stripeCardFormRef} />
            </FormGroup>

            <div className="flex justify-end">
                <Button type="submit" label={isProcessing ? "Processing..." : "Purchase"} disabled={isProcessing} />
            </div>
        </Form>
    );
};
