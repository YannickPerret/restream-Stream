'use client'
import React from 'react';
import useCartStore from '#stores/useCartStore';

const CartItem = ({ item }) => {
    const { removeFromCart, updateCartItem } = useCartStore((state) => ({
        removeFromCart: state.removeFromCart,
        updateCartItem: state.updateCartItem,
    }));

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        updateCartItem(item.id, { ...item, quantity: newQuantity });
    };

    return (
        <div className="flex items-center justify-between bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
            <div className="flex items-center">
                <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div>
                    <h3 className="text-lg font-semibold">{item.productName}</h3>
                    <p className="text-gray-400">Price: ${item.price}</p>
                </div>
            </div>
            <div className="flex items-center">
                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={handleQuantityChange}
                    className="w-16 p-2 text-center bg-gray-900 rounded-lg"
                />
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default CartItem;
