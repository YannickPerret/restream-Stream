import React, {useState} from "react";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {useRouter} from "next/navigation.js";
import Form from "#components/_forms/Form.jsx";
import FormGroup from "#components/_forms/FormGroup.jsx";
import Input from "#components/_forms/Input.jsx";
import Button from "#components/_forms/Button.jsx";

export const CheckoutForm = ({ product }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: {
                name: formData.name,
                email: formData.email,
                address: {
                    line1: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.zip,
                },
            },
        });

        if (error) {
            console.error(error);
            setIsProcessing(false);
            return;
        }

        const response = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                amount: product.isMonthly ? product.monthlyPrice : product.annualPrice,
                currency: 'usd',
                productId: product.id,
            }),
        });

        const paymentIntentData = await response.json();

        if (paymentIntentData.error) {
            console.error(paymentIntentData.error);
            setIsProcessing(false);
            return;
        }

        router.push('/checkout/success');
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup title="Personal Information">
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

            <FormGroup title="Billing Address">
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
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="Enter your ZIP/postal code"
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
                    }}
                />
            </FormGroup>

            <div className="flex justify-between">
                <Button type="submit" label={isProcessing ? "Processing..." : "Complete Purchase"} disabled={isProcessing} />
                <Button type="reset" label="Reset Form" />
            </div>
        </Form>
    );
};