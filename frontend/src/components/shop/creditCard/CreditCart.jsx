// frontend/src/components/shop/creditCard/CreditCart.jsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import FormGroup from "#components/_forms/FormGroup.jsx";

const StripeCardForm = forwardRef((props, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState('');

    // Fonction pour récupérer les informations de la carte et créer un PaymentMethod
    const handleCardDetails = async () => {
        if (!stripe || !elements) {
            setErrorMessage('Stripe.js has not loaded yet. Please try again.');
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardNumberElement,
        });

        if (error) {
            setErrorMessage(error.message);
            return null;
        }

        return paymentMethod;
    };

    // Exposer la méthode handleCardDetails au parent via la référence
    useImperativeHandle(ref, () => ({
        handleCardDetails,
    }));

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Card Number</label>
                <div className="bg-gray-900 text-white p-3 rounded-md border border-gray-700">
                    <CardNumberElement
                        options={{
                            showIcon: true,
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
                </div>
            </div>

            <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Expiration Date</label>
                    <div className="bg-gray-900 text-white p-3 rounded-md border border-gray-700">
                        <CardExpiryElement
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
                    </div>
                </div>

                <div className="w-1/2 ml-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">CVC</label>
                    <div className="bg-gray-900 text-white p-3 rounded-md border border-gray-700">
                        <CardCvcElement
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
                    </div>
                </div>
            </div>

            {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        </div>
    );
});

export default StripeCardForm;
