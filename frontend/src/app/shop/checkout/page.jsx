// frontend/src/app/shop/checkout/page.jsx
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useProductStore from '#stores/useProductStore.js';
import withAuth from '../../../../hoc/withAuth.js';
import CheckoutCart from '#components/shop/checkout/Cart.jsx';
import { useSearchParams, useRouter } from 'next/navigation';
import useCheckoutStore from '#stores/useCheckoutStore.js';
import OrderApi from '#api/order.js';
import PriceToggle from '#components/priceList/PriceToggle.jsx';
import { CheckoutForm } from '#components/shop/CheckoutForm.jsx';
import Breadcrumb from "#components/breadcrumb/Breadcrumb.jsx";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const CheckoutPageContent = ({ productId }) => {
    const { fetchProductById, isLoading } = useProductStore();
    const { formData, setIsProcessing, setPaymentError } = useCheckoutStore();
    const isMonthly = useCheckoutStore((state) => state.isMonthly);
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [finalPrice, setFinalPrice] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const fetchedProduct = await fetchProductById(productId);
                const price = isMonthly ? fetchedProduct.monthlyPrice : (fetchedProduct.annualPrice - fetchedProduct.directDiscount)
                setProducts([{ ...fetchedProduct, price }]);
                setFinalPrice(price);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        if (productId) fetchProduct();
    }, [productId, isMonthly, fetchProductById]);

    const handleDiscountApplied = (discount) => {
        if (!discount.isCombinable) {
            setDiscounts([discount]);
        } else if (!discounts.some((existingDiscount) => existingDiscount.id === discount.id)) {
            setDiscounts([...discounts, discount]);
        }

        const discountAmount = discount.type === 'percentage'
            ? (finalPrice * discount.amount) / 100
            : discount.amount;
        setFinalPrice((prevPrice) => Math.max(0, prevPrice - discountAmount));
    };

    const handleSubmit = async (paymentMethodId) => {
        setIsProcessing(true);
        try {
            const countryCode = formData.country;
            if (!countryCode) {
                throw new Error(`Country '${formData.country}' is unknown. Please enter a valid country.`);
            }

            const appliedDiscounts = discounts.length > 0 ? discounts.map(discount => discount.id) : [];
            const items = products.map(item => ({
                productId: item.id,
                quantity: 1,
            }));

            const returnUrl = `${window.location.origin}/shop/checkout/${productId}/success`;

            const orderResponse = await OrderApi.create({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || null,
                items,
                paymentMethodId,
                discounts: appliedDiscounts,
                currency: 'usd',
                address: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: countryCode,
                },
                returnUrl,
                isMonthly,
            });

            setIsProcessing(false);
            if (orderResponse.success) {
                router.push(`/shop/checkout/${orderResponse.order.slug}/success`);
            }
        } catch (err) {
            setPaymentError(err.message);
            setIsProcessing(false);
        }
    };

    if (isLoading || !products.length) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row">
            <CheckoutCart products={products} discounts={discounts} handleDiscountApplied={handleDiscountApplied} />
            <Elements stripe={stripePromise}>
                <div className="lg:w-2/3">
                    <CheckoutForm handleSubmit={handleSubmit} />
                </div>
            </Elements>
        </div>
    );
};

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');

    return (
        <section className="flex flex-col h-full rounded-2xl justify-center shadow-2xl pt-44 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('/hero_background.svg')" }}>
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <Breadcrumb
                    paths={[
                        { label: 'Home', href: '/' },
                        //{ label: 'Shop', href: '/shop' },
                        { label: 'Checkout', href: '/shop/checkout' },
                    ]}
                />
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Payment Checkout</h1>
                </div>
                <hr className="border-b-1 border-blueGray-300 pb-6" />

                <div className="container mx-auto flex justify-center my-8">
                    <PriceToggle />
                </div>
                <Suspense>
                    <CheckoutPageContent productId={productId} />
                </Suspense>
            </div>
        </section>
    );
};

export default withAuth(CheckoutPage, true);
