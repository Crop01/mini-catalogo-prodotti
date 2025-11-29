import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Grouping all filters in a single state object
    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        min_price: '',
        sort_by: 'created_at',
        sort_dir: 'desc',
        page: 1
    });

    const [meta, setMeta] = useState({}); // "meta" is a standard term for pagination data

    useEffect(() => {
        // Initial loading of categories
        const loadCategories = async () => {
            try {
                const { data } = await api.getCategories();
                setCategories(data);
            } catch (e) {
                console.error(e);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        // Fetch products whenever filters change, timeout for better UX
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300); 

        return () => clearTimeout(timer);
    }, [filters]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Remove empty keys
            const params = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) params[key] = filters[key];
            });

            const { data } = await api.getProducts(params);
            
            setProducts(data.data);
            setMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total
            });
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateFilter = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Catalogo Prodotti</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                    type="text" 
                    name="search"
                    placeholder="Cerca..." 
                    className="border p-2 rounded"
                    value={filters.search}
                    onChange={updateFilter}
                />

                <select name="category_id" className="border p-2 rounded" value={filters.category_id} onChange={updateFilter}>
                    <option value="">Tutte le Categorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <input 
                    type="number" 
                    name="min_price"
                    placeholder="Min €" 
                    className="border p-2 rounded"
                    value={filters.min_price}
                    onChange={updateFilter}
                />

                <select name="sort_by" className="border p-2 rounded" value={filters.sort_by} onChange={updateFilter}>
                    <option value="created_at">Più recenti</option>
                    <option value="price">Prezzo</option>
                    <option value="name">Nome</option>
                </select>
            </div>

            {isLoading ? (
                <div className="text-center py-10 opacity-50">Caricamento...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Prodotto</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Prezzo</th>
                                <th className="p-4">Tags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 border-b last:border-0">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {p.category?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono">€ {p.price}</td>
                                    <td className="p-4">
                                        {p.tags?.map(t => (
                                            <span key={t} className="mr-1 text-gray-500 text-xs bg-gray-100 px-1 rounded">#{t}</span>
                                        ))}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">Nessun prodotto trovato.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="p-4 flex justify-between items-center bg-gray-50">
                        <button 
                            disabled={meta.current_page === 1}
                            onClick={() => changePage(meta.current_page - 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50"
                        >
                            Indietro
                        </button>
                        <span className="text-sm text-gray-600">
                            Pagina {meta.current_page} di {meta.last_page}
                        </span>
                        <button 
                            disabled={meta.current_page === meta.last_page}
                            onClick={() => changePage(meta.current_page + 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50"
                        >
                            Avanti
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}