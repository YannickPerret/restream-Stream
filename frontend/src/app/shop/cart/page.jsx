'use client'
import React, { useEffect } from 'react';
import useCartStore from '#stores/useCartStore';

const Cart = () => {
    const { cartItems, fetchCartItems, calculateCart } = useCartStore((state) => ({
        cartItems: state.cartItems,
        fetchCartItems: state.fetchCartItems,
        calculateCart: state.calculateCart,
    }));

    useEffect(() => {
        fetchCartItems(); // Fetch items when the component mounts
    }, [fetchCartItems]);

    return (
        <section className="container mx-auto py-36">
            <h1 className="text-4xl font-bold text-center text-white mb-8">Your Cart</h1>
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
                {cartItems.length === 0 ? (
                    <p className="text-gray-400 text-center">Your cart is empty.</p>
                ) : (
                    <>
                        <div className="flex flex-col space-y-4">
                            {cartItems.map((item) => (
                                {/*<CartItem key={item.id} item={item} />
                                */},
                                null
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Total: ${calculateCart()}</h2>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg">
                                Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Cart;
