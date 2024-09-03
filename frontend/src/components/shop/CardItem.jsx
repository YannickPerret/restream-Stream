import React from 'react';
import Button from '#components/_forms/Button';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
    const handleRemove = () => {
        onRemove(item.id);
    };

    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value;
        onUpdateQuantity(item.id, newQuantity);
    };

    return (
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-gray-400">Price: ${item.price}</p>
                    <p className="text-gray-400">Discount: {item.discount}%</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={handleQuantityChange}
                    className="w-16 p-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-white font-semibold">
                    ${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                </p>
                <Button label="Remove" onClick={handleRemove} type="button" />
            </div>
        </div>
    );
};

export default CartItem;
