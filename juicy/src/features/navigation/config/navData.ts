import { CartItem } from '../types';

// Sample cart items for demonstration
export const sampleCartItems: CartItem[] = [
    {
        id: 1,
        name: "Original Strike",
        price: 4.99,
        quantity: 1,
        image: "/assets/images/can/lemon.webp",
    },
    {
        id: 2,
        name: "Ultra Void",
        price: 5.49,
        quantity: 1,
        image: "/assets/images/can/blueberry.webp",
    },
];

export const getTotalPrice = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};