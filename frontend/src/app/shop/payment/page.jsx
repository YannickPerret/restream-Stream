'use client'
import React, { useState } from 'react';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Label from '#components/_forms/Label';
import Radio from '#components/_forms/Radio';
import Button from '#components/_forms/Button';
import useCartStore from '#stores/useCartStore';

const PaymentPage = () => {
    const { calculateCart } = useCartStore((state) => ({
        calculateCart: state.calculateCart,
    }));

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Tokenize card details (simulate this for now, you can integrate with a payment gateway like Stripe for real implementation)
        const tokenizedCardData = {
            cardNumber: '**** **** **** ' + cardNumber.slice(-4), // Hide all but last 4 digits
            expiryDate,
            cvv,
            nameOnCard,
        };

        // Here you would send the tokenizedCardData to your backend securely
        console.log('Payment submitted with tokenized data:', tokenizedCardData);
    };

    const handleReset = () => {
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setNameOnCard('');
        setPaymentMethod('credit_card');
    };

    return (
        <section className="py-36 bg-gray-900 text-white">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Payment</h1>
                <Form onSubmit={handleSubmit} onReset={handleReset}>
                    <FormGroup title="Payment Details">
                        <Radio
                            label="Credit Card"
                            checked={paymentMethod === 'credit_card'}
                            onChange={() => setPaymentMethod('credit_card')}
                        />
                        <Radio
                            label="PayPal"
                            description="You will be redirected to PayPal to complete your payment."
                            checked={paymentMethod === 'paypal'}
                            onChange={() => setPaymentMethod('paypal')}
                        />
                    </FormGroup>

                    {paymentMethod === 'credit_card' && (
                        <FormGroup title="Credit Card Information">
                            <Input
                                label="Card Number"
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                            <div className="flex space-x-4">
                                <Input
                                    label="Expiry Date"
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                                <Input
                                    label="CVV"
                                    type="text"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </div>
                            <Input
                                label="Name on Card"
                                type="text"
                                placeholder="John Doe"
                                value={nameOnCard}
                                onChange={(e) => setNameOnCard(e.target.value)}
                            />
                        </FormGroup>
                    )}

                    <FormGroup title="Summary">
                        <p className="text-lg">Total: ${calculateCart()}</p>
                    </FormGroup>

                    <div className="flex justify-between mt-8">
                        <Button label="Reset" type="reset" />
                        <Button label="Submit Payment" type="submit" />
                    </div>
                </Form>
            </div>
        </section>
    );
};

export default PaymentPage;
