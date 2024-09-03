'use client'
import React, {useEffect} from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation.js";
import Form from "#components/_forms/Form.jsx";
import FormGroup from "#components/_forms/FormGroup.jsx";
import Input from "#components/_forms/Input.jsx";
import Button from "#components/_forms/Button.jsx";
import useCheckoutStore from "#stores/useCheckoutStore.js";
import useOrderStore from "#stores/useOrderStore.js";
import OrderApi from "#api/order.js";
import {useSessionStore} from "#stores/useSessionStore.js";

export const CheckoutForm = ({ product, isMonthly }) => {
    const { formData, setFormData, isProcessing, setIsProcessing, setPaymentError } = useCheckoutStore();
    const { setOrderData } = useOrderStore();
    const {session} = useSessionStore()
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    // Pre-fill the email from the session when the component mounts
    useEffect(() => {
        if (session && session.user && session.user.email) {
            setFormData({ email: session.user.email });
        }
    }, [session, setFormData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone,
                    email: formData.email,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zip,
                        country: formData.country,
                    },
                },
            });

            if (error) {
                throw error;
            }

            const returnUrl = `${window.location.origin}/shop/checkout/success`;

            // Create an order with a single product item
            const orderResponse = await OrderApi.create({
                items: [
                    {
                        productId: product.id,
                        quantity: 1,
                    },
                ],
                isMonthly,
                paymentMethodId: paymentMethod.id,
                currency: 'usd',
                returnUrl,
                address: formData,
            });

            if (!orderResponse.success) {
                throw new Error('Order creation failed');
            }

            const { order, paymentIntent } = orderResponse;

            // Store the order and payment data in the Zustand store
            setOrderData(order, paymentIntent);

            setIsProcessing(false);

            // Navigate to the success page
            router.push('/shop/checkout/success');

        } catch (error) {
            console.error('Error processing payment:', error);
            setPaymentError(error.message);
            setIsProcessing(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup title="Personal Information">
                <Input
                    label="FirstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your firstname"
                />
                <Input
                    label="LastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your lastname"
                />
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    disabled={true}
                />
            </FormGroup>

            <FormGroup title="Billing Address">
                <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                />
                <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your billing address"
                />
                <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                />
                <Input
                    label="State/Province"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter your state/province"
                />
                <Input
                    label="ZIP/Postal Code"
                    name="zip"
                    type="number"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="Enter your ZIP/postal code"
                />

                <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter your country"
                />
            </FormGroup>

            <FormGroup title="Payment Information">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#fff',
                                '::placeholder': {
                                    color: '#87bbfd',
                                },
                            },
                            invalid: {
                                color: '#e5424d',
                            },
                        },
                        hidePostalCode:true,
                    }}
                />
            </FormGroup>

            <div className="flex justify-between">
                <Button type="submit" label={isProcessing ? "Processing..." : "Complete Purchase"} disabled={isProcessing} />
                <Button type="reset" label="Reset " />
            </div>
        </Form>
    );
};
