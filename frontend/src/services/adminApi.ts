import { api } from './api';

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high';

export interface OrderItem {
    productId: Product | string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    _id: string;
    customerId: Customer | string;
    items: OrderItem[];
    status: OrderStatus;
    priority: OrderPriority;
    total: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

function toQueryString(params: Record<string, unknown>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') continue;
        query.set(key, String(value));
    }
    const qs = query.toString();
    return qs ? `?${qs}` : '';
}

export async function listUsers(params: Record<string, unknown>) {
    return api.get<PaginatedResponse<Customer>>(`/users${toQueryString(params)}`);
}

export async function createUser(data: Partial<Customer>) {
    return api.post<Customer>('/users', data);
}

export async function updateUser(id: string, data: Partial<Customer>) {
    return api.put<Customer>(`/users/${id}`, data);
}

export async function deleteUser(id: string) {
    return api.delete<Customer>(`/users/${id}`);
}

export async function listProducts(params: Record<string, unknown>) {
    return api.get<PaginatedResponse<Product>>(`/products${toQueryString(params)}`);
}

export async function getProduct(id: string) {
    return api.get<Product>(`/products/${id}`);
}

export async function createProduct(data: Partial<Product>) {
    return api.post<Product>('/products', data);
}

export async function updateProduct(id: string, data: Partial<Product>) {
    return api.put<Product>(`/products/${id}`, data);
}

export async function deleteProduct(id: string) {
    return api.delete<Product>(`/products/${id}`);
}

export async function listOrders(params: Record<string, unknown>) {
    return api.get<PaginatedResponse<Order>>(`/orders${toQueryString(params)}`);
}

export async function getOrder(id: string) {
    return api.get<Order>(`/orders/${id}`);
}

export async function createOrder(data: {
    customerId: string;
    priority?: OrderPriority;
    items: Array<{ productId: string; quantity: number }>;
}) {
    return api.post<Order>('/orders', data);
}

export async function updateOrder(id: string, data: Partial<Pick<Order, 'status' | 'priority'>>) {
    return api.put<Order>(`/orders/${id}`, data);
}

export async function deleteOrder(id: string) {
    return api.delete<Order>(`/orders/${id}`);
}
