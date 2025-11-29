import axios from 'axios';

// api configuration 
const apiClient = axios.create({
    baseURL: '/api', // Laravel API base URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default {
    // Products
    getProducts: (params) => apiClient.get('/products', { params }), // params handles page, search, sort, etc.
    getProduct: (id) => apiClient.get(`/products/${id}`),
    createProduct: (data) => apiClient.post('/products', data),
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`),

    // Categories
    getCategories: () => apiClient.get('/categories'),
};