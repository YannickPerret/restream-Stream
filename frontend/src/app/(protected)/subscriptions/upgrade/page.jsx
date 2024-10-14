'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import SubscriptionApi from '#api/subscription';
import ProductApi from '#api/product';
import { useAuthStore } from '#stores/useAuthStore';
import Button from "#components/_forms/Button.jsx";
import Select from '#components/_forms/Select.jsx';
import Form from '#components/_forms/Form.jsx';
import CheckoutCart from '#components/shop/checkout/Cart.jsx';  // Import CheckoutCart
import useDiscountStore from "#stores/useDiscountStore.js";  // Import discount store

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const UpgradeSubscriptionForm = ({ subscriptionId, products, user, selectedProduct, finalPrice, discounts, handleDiscountApplied, isMonthly }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !selectedProduct) {
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardNumberElement);

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                },
            });

            if (error) {
                throw error;
            }

            // Call the backend API to upgrade subscription
            const returnUrl = `${window.location.origin}/subscriptions/success`;
            const upgradeResponse = await SubscriptionApi.upgrade({
                subscriptionId,
                productId: selectedProduct.id,
                isMonthly,
                paymentMethodId: paymentMethod.id,
                returnUrl,
            });

            if (upgradeResponse.success) {
                router.push('/subscriptions/success');
            } else {
                throw new Error('Failed to upgrade subscription');
            }
        } catch (err) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    return (

        <Form onSubmit={handleSubmit}>
            <CheckoutCart
                products={[selectedProduct]} // Pass the selected product
                discounts={discounts}
                basePrice={isMonthly ? selectedProduct.monthlyPrice : selectedProduct.annualPrice}
                finalPrice={finalPrice}
                handleDiscountApplied={handleDiscountApplied}
            />

            <div>
                <label className="block mb-2">Card Details</label>
                <div className="p-4 border rounded">
                    <CardNumberElement className="w-full mb-4 p-2 border rounded" />
                    <div className="flex space-x-4">
                        <CardExpiryElement className="w-1/2 p-2 border rounded" />
                        <CardCvcElement className="w-1/2 p-2 border rounded" />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" label={isProcessing ? 'Processing...' : 'Upgrade Subscription'} disabled={isProcessing} />
        </Form>
    );
};

const UpgradeSubscriptionPageContent = () => {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const subscriptionId = searchParams.get('subscriptionId');
    const { discount } = useDiscountStore();
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isMonthly, setIsMonthly] = useState(true);
    const [finalPrice, setFinalPrice] = useState(0);
    const [discounts, setDiscounts] = useState([]); // Initialize discounts array
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentProductGroupId, setCurrentProductGroupId] = useState(null);

    const handleDiscountApplied = (appliedDiscount) => {
        setDiscounts([appliedDiscount]);
        const discountAmount = appliedDiscount.type === 'percentage'
            ? (finalPrice * appliedDiscount.amount) / 100
            : appliedDiscount.amount;

        setFinalPrice(Math.max(0, finalPrice - discountAmount));
    };

    useEffect(() => {
        const fetchProductsAndSubscription = async () => {
            // Fetch the current subscription
            console.log('Fetching subscription:', subscriptionId);
            const subscription = await SubscriptionApi.getOne(subscriptionId);
            const currentProduct = subscription.product;
            const groupId = currentProduct.productGroupId; // Get the product group ID
            setCurrentProductGroupId(groupId);

            // Fetch all products and filter them by the same product group
            const allProducts = await ProductApi.getAll();
            const filteredProducts = allProducts.filter(product => product.productGroupId === groupId);
            setProducts(filteredProducts);

            // Set the default selected product and calculate the price
            const defaultProduct = filteredProducts[0];
            setSelectedProduct(defaultProduct);
            setFinalPrice(isMonthly ? defaultProduct.monthlyPrice : defaultProduct.annualPrice);
        };

        fetchProductsAndSubscription();
    }, [subscriptionId, isMonthly]);

    return (
        <div className="w-full lg:w-2/3 bg-gray-900 p-8 rounded-lg shadow-lg">
            <Elements stripe={stripePromise}>
                {selectedProduct && (
                    <UpgradeSubscriptionForm
                        subscriptionId={subscriptionId}
                        products={products}
                        user={user}
                        selectedProduct={selectedProduct}
                        finalPrice={finalPrice}
                        discounts={discounts}
                        handleDiscountApplied={handleDiscountApplied}
                        isMonthly={isMonthly}
                    />
                )}
            </Elements>
        </div>
    );
};

export default function UpgradeSubscriptionPage() {
    return (
        <section className="flex flex-col w-full h-full justify-center shadow-2xl pt-44 bg-cover bg-no-repeat bg-center"
                 style={{ backgroundImage: "url('/hero_background.svg')" }}>
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-center mb-8 text-white">Upgrade Subscription</h1>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6" />
                <UpgradeSubscriptionPageContent />
            </div>
        </section>
    );
}
