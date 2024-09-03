import React, { useState } from 'react';
import Input from '#components/_forms/Input';
import valid from 'card-validator';

const CreditCardInput = ({ formData, handleChange, setError }) => {
    const [cardErrors, setCardErrors] = useState({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    });

    const validateCardNumber = (number) => {
        const validation = valid.number(number);
        if (validation.isValid) {
            setCardErrors((prev) => ({ ...prev, cardNumber: '' }));
            setError((prev) => ({ ...prev, cardNumber: false }));
        } else {
            setCardErrors((prev) => ({ ...prev, cardNumber: 'Invalid card number' }));
            setError((prev) => ({ ...prev, cardNumber: true }));
        }
    };

    const validateExpiryDate = (date) => {
        const validation = valid.expirationDate(date);
        if (validation.isValid) {
            setCardErrors((prev) => ({ ...prev, expiryDate: '' }));
            setError((prev) => ({ ...prev, expiryDate: false }));
        } else {
            setCardErrors((prev) => ({ ...prev, expiryDate: 'Invalid expiry date' }));
            setError((prev) => ({ ...prev, expiryDate: true }));
        }
    };

    const validateCvc = (cvc) => {
        const validation = valid.cvv(cvc);
        if (validation.isValid) {
            setCardErrors((prev) => ({ ...prev, cvc: '' }));
            setError((prev) => ({ ...prev, cvc: false }));
        } else {
            setCardErrors((prev) => ({ ...prev, cvc: 'Invalid CVC' }));
            setError((prev) => ({ ...prev, cvc: true }));
        }
    };

    return (
        <div>
            <Input
                label="Card Number"
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => {
                    handleChange(e);
                    validateCardNumber(e.target.value);
                }}
                placeholder="Enter your credit card number"
            />
            {cardErrors.cardNumber && <p className="text-red-500">{cardErrors.cardNumber}</p>}

            <Input
                label="Expiry Date"
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => {
                    handleChange(e);
                    validateExpiryDate(e.target.value);
                }}
                placeholder="MM/YY"
            />
            {cardErrors.expiryDate && <p className="text-red-500">{cardErrors.expiryDate}</p>}

            <Input
                label="CVC"
                type="password"
                name="cvc"
                value={formData.cvc}
                onChange={(e) => {
                    handleChange(e);
                    validateCvc(e.target.value);
                }}
                placeholder="Enter the CVC"
            />
            {cardErrors.cvc && <p className="text-red-500">{cardErrors.cvc}</p>}
        </div>
    );
};

export default CreditCardInput;
