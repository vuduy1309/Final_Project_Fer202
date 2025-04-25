import { v4 as uuidv4 } from "uuid";
import axiosInstance from "./axiosInstance";
export async function getOrders() {
    const response = await axiosInstance.get("/orders");
    return response.data;
}
export async function getOrderById(id) {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
}
export async function getOrdersByUser(userId) {
    const response = await axiosInstance.get(`/orders`, { params: { userId } });
    return response.data;
}
export async function createOrder(userId, items, totalAmount, shippingAddress, paymentMethod) {
    const newOrder = {
        id: uuidv4(),
        userId,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentStatus: "Pending",
        orderStatus: "Processing",
        createdAt: new Date().toISOString(),
    };
    const response = await axiosInstance.post("/orders", newOrder);
    return response.data;
}

export async function rateProduct(orderId, updatedOrder, productId, rating, comment, name, avatar) {
    const response = await axiosInstance.put(`/orders/${orderId}`, updatedOrder);
    const { data: product } = await axiosInstance.get(`/products/${productId}`);

    const updatedProduct = {
        ...product,
        sold: (product.sold || 0) + 1,
        total_rate: (product.total_rate || 0) + rating,
        comments: [
            ...(product.comments || []),
            {
                username: name,
                avatar: avatar,
                rating,
                comment,
                createdAt: new Date().toISOString(),
            }
        ],
    };

    try {
        await axiosInstance.put(`/products/${productId}`, updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
    }

    return response.data;
}
