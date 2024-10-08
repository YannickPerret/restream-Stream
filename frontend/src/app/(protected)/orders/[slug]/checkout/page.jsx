'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Panel from "#components/layout/panel/Panel.jsx";
import { CheckoutForm } from "#components/shop/CheckoutForm.jsx";
import CheckoutCart from "#components/shop/checkout/Cart.jsx";
import OrderApi from "#api/order.js";
import {Elements, useElements, useStripe, CardNumberElement} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useCheckoutStore from "#stores/useCheckoutStore.js";
import PriceToggle from "#components/priceList/PriceToggle.jsx";
import { getCountryCode } from 'countries-list';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function CheckoutLogic({ order, isMonthly, discounts }) {
    const {formData, setIsProcessing, setPaymentError} = useCheckoutStore();
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async () => {

        if (!stripe || !elements) {
            return setPaymentError('Stripe.js has not loaded yet. Please try again.');
        }

        setIsProcessing(true);

        try {
            const countryCode = getCountryCode(formData.country);
            if (!countryCode) {
                throw new Error(`Country '${formData.country}' is unknown. Please enter a valid country.`);
            }

            const cardElement = elements.getElement(CardNumberElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zip,
                        country: countryCode,
                    },
                },
            });

            if (error) {
                throw error;
            }

            const appliedDiscounts = discounts && discounts.length > 0 ? discounts.map(discount => discount.id) : [];

            const items = order.items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
            }));

            const returnUrl = `${window.location.origin}/shop/checkout/${order.slug}/success`;
            // Make API call to renew the order
            const orderResponse = await OrderApi.renewSubscription({
                orderId: order.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || null,
                items: items,
                isMonthly,
                paymentMethodId: paymentMethod.id,
                discounts: appliedDiscounts,
                currency: 'usd',
                address: { ...paymentMethod.billing_details.address },
                returnUrl,
            });

            if (!orderResponse.success) {
                throw new Error('Order renewal failed');
            }

            const renewedOrder = orderResponse.order;
            setIsProcessing(false);

            // Redirect on successful renewal
            if (renewedOrder.status === 'completed') {
                window.location.href = returnUrl;
            }

        } catch (error) {
            console.error('Error processing payment:', error);
            setPaymentError(error.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="lg:w-2/3">
            <CheckoutForm handleSubmit={handleSubmit} />
        </div>
    );
}

export default function OrderRenewCheckout() {
    const { slug } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMonthly, setIsMonthly] = useState(true);
    const [discounts, setDiscounts] = useState([]);
    const [finalPrice, setFinalPrice] = useState(0);

    // Fetch order by slug
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await OrderApi.getOneBySlug(slug);
                setOrder(orderData);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchOrder();
        }
    }, [slug]);

    // Calculate final price when discounts or order change
    useEffect(() => {
        if (order && order.items) {
            const basePrice = order.items.reduce((total, item) => {
                const product = item.product;
                return total + (product.purchaseType === 'subscription'
                    ? isMonthly ? product.monthlyPrice : product.annualPrice
                    : product.price);
            }, 0);

            const newFinalPrice = discounts.reduce((total, discount) => {
                if (discount.type === 'percentage') {
                    return total - (total * discount.amount) / 100;
                } else {
                    return total - discount.amount;
                }
            }, basePrice);

            setFinalPrice(newFinalPrice);
        }
    }, [discounts, order, isMonthly]);

    const handleDiscountApplied = (discount) => {
        console.log("Applied discount:", discount);
        if (!discount.isCombinable) {
            setDiscounts([discount]);
        } else if (!discounts.some((d) => d.id === discount.id)) {
            setDiscounts([...discounts, discount]);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!order) {
        return <div>Error: Order not found.</div>;
    }

    return (
        <Panel title={`Order Renew Checkout - Order Id : #${order.slug || ''}`} darkMode={true}>
            <div className="flex flex-col justify-center items-center bg-gray-900 p-8 rounded-lg">
                <h3 className="text-white mb-4">Choose the plan payment that fits your needs</h3>
                <PriceToggle isMonthly={isMonthly} setIsMonthly={setIsMonthly} />
            </div>

            <div className="lg:flex lg:space-x-8">
                {/* Cart displaying products and discounts */}
                <CheckoutCart products={order.items.map(item => item.product)} discounts={discounts} monthly={isMonthly} handleDiscountApplied={handleDiscountApplied} finalPrice={finalPrice} />

                {/* Checkout Form */}
                <Elements stripe={stripePromise}>
                    <CheckoutLogic
                        order={order}
                        isMonthly={isMonthly}
                        discounts={discounts}
                        handleDiscountApplied={handleDiscountApplied}
                        finalPrice={finalPrice}
                    />
                </Elements>
            </div>
        </Panel>
    );
}
