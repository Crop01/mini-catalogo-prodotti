import React, { useState, useEffect, useCallback } from 'react'; // added useCallback
import api from '../services/api';
import ProductForm from './ProductForm';

// Custom hook debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [meta, setMeta] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const [filters, setFilters] = useState({
        category_id: '',
        min_price: '',
        sort_by: 'created_at',
        sort_dir: 'desc',
        page: 1
    });

    // Load categories once
    useEffect(() => {
        api.getCategories().then(res => setCategories(res.data));
    }, []);

    // --- Fetch Function (Moved out for reuse) ---
    // Using useCallback to avoid recreating the function on every render
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                ...filters,
                search: debouncedSearch,
            };

            // Cleaning parameters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const { data } = await api.getProducts(params);
            setProducts(data.data);
            setMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total
            });
        } catch (error) {
            console.error("Errore API", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, debouncedSearch]); 

    // Trigger Fetch when filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); 

    // Event Handlers

    // 1. Open Modal (Create)
    const handleCreate = () => {
        setEditingId(null); // ID null = Create
        setIsModalOpen(true);
    };

    // 2. Open Modal (Edit)
    const handleEdit = (id) => {
        setEditingId(id); // ID present = Edit
        setIsModalOpen(true);
    };

    // 3. Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo prodotto?")) return;

        try {
            await api.deleteProduct(id);
            fetchProducts(); // Reload the list after deletion
        } catch (error) {
            alert("Errore durante l'eliminazione");
        }
    };

    // 4. Callback after form success
    const handleFormSuccess = () => {
        setIsModalOpen(false);
        fetchProducts(); // Reload the list to see changes
    };

    // UI Filter Handlers
    const handleSearch = (e) => setSearchTerm(e.target.value);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            Prodotti
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Gestisci il catalogo, le categorie e l'inventario.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        + Nuovo Prodotto
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <input 
                        type="text" 
                        placeholder="Cerca prodotti..." 
                        className="border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500 w-full"
                        value={searchTerm}
                        onChange={handleSearch}
                    />

                    {/* Category Select */}
                    <select 
                        name="category_id" 
                        className="border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500 w-full" 
                        value={filters.category_id} 
                        onChange={handleFilterChange}
                    >
                        <option value="">Tutte le Categorie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    {/* Min Price Input */}
                    <input 
                        type="number" 
                        name="min_price"
                        placeholder="Prezzo Min €" 
                        className="border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500 w-full"
                        value={filters.min_price}
                        onChange={handleFilterChange}
                    />

                    {/* Sort Select */}
                    <select 
                        name="sort_by" 
                        className="border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500 w-full" 
                        value={filters.sort_by} 
                        onChange={handleFilterChange}
                    >
                        <option value="created_at">Più recenti</option>
                        <option value="price">Prezzo</option>
                        <option value="name">Nome (A-Z)</option>
                    </select>
                </div>

                {/* Data Grid / Table Section */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="mt-2 text-slate-500 text-sm">Caricamento...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prezzo</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.length > 0 ? products.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{p.name}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {p.category?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-slate-600">€ {p.price}</td>
                                        <td className="p-4">
                                            {p.tags?.map((t, i) => (
                                                <span key={i} className="mr-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                    #{t}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleEdit(p.id)}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
                                            >
                                                Modifica
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="text-sm font-medium text-rose-600 hover:text-rose-900 transition-colors"
                                            >
                                                Elimina
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            Nessun prodotto trovato.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination Footer */}
                        {meta.last_page > 1 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                                <button 
                                    disabled={meta.current_page === 1}
                                    onClick={() => changePage(meta.current_page - 1)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Indietro
                                </button>
                                <span className="text-sm text-slate-500">
                                    Pagina <span className="font-medium text-slate-900">{meta.current_page}</span> di {meta.last_page}
                                </span>
                                <button 
                                    disabled={meta.current_page === meta.last_page}
                                    onClick={() => changePage(meta.current_page + 1)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Avanti
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Modal Injection */}
            {isModalOpen && (
                <ProductForm 
                    productId={editingId} 
                    onSuccess={handleFormSuccess} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
}