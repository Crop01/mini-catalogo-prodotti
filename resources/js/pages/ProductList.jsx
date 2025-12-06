import React, { useState, useEffect, useCallback } from 'react'; // added useCallback
import api from '../services/api';
import ProductForm from './ProductForm';
import DeleteModal from './DeleteModal';

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

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const [deleteModal, setDeleteModal] = useState({ 
        isOpen: false, 
        productId: null, 
        productName: '' 
    });

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

    // Open Modal (Create)
    const handleCreate = () => {
        setEditingId(null); // ID null = Create
        setIsFormOpen(true);
    };

    // Open Modal (Edit)
    const handleEdit = (id) => {
        setEditingId(id); // ID present = Edit
        setIsFormOpen(true);
    };

    // Delete
    const handleDeleteClick = (product) => {
        setDeleteModal({
            isOpen: true,
            productId: product.id,
            productName: product.name
        });
    };

    // Confirm Delete -> call API
    const confirmDelete = async () => {
        if (!deleteModal.productId) return;
        try {
            await api.deleteProduct(deleteModal.productId);
            setDeleteModal({ ...deleteModal, isOpen: false }); // Chiudi modale
            fetchProducts(); // Ricarica lista
        } catch (error) {
            alert("Errore durante l'eliminazione");
        }
    };
    
    // Callback after form success
    const handleFormSuccess = () => {
        setIsFormOpen(false);
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
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Prodotti
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Gestisci il catalogo, le categorie e l'inventario.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleCreate}
                        className="btn-primary"
                    >
                        + Nuovo Prodotto
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cerca prodotti..." 
                            className="input-base pl-10 text-sm"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <select name="category_id" className="input-base text-sm" value={filters.category_id} onChange={handleFilterChange}>
                        <option value="">Tutte le Categorie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-400 sm:text-sm">€</span>
                        </div>
                        <input 
                            type="number" 
                            name="min_price"
                            placeholder="Prezzo Min" 
                            className="input-base pl-8 text-sm"
                            value={filters.min_price}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <select name="sort_by" className="input-base text-sm" value={filters.sort_by} onChange={handleFilterChange}>
                        <option value="created_at">Più recenti</option>
                        <option value="price">Prezzo</option>
                        <option value="name">Nome (A-Z)</option>
                    </select>
                </div>

                {/* Data Grid Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 space-y-6 animate-pulse">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-6 border-b border-slate-100 pb-6 last:border-0">
                                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                                    <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="px-6 py-4">Prodotto</th>
                                            <th className="px-6 py-4">Categoria</th>
                                            <th className="px-6 py-4">Prezzo</th>
                                            <th className="px-6 py-4">Tags</th>
                                            <th className="px-6 py-4 text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {products.length > 0 ? products.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900">{p.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                        {p.category?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-600 tabular-nums">
                                                    € {Number(p.price).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {p.tags?.map((t, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-primary-50 text-primary-700 border border-primary-100">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    {/* BOTTONI ORA VISIBILI (rimosso opacity-0) */}
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            onClick={() => handleEdit(p.id)}
                                                            className="font-medium text-slate-500 hover:text-primary-600 transition-colors"
                                                        >
                                                            Modifica
                                                        </button>
                                                        <span className="text-slate-300">|</span>
                                                        <button 
                                                            onClick={() => handleDeleteClick(p)} // Nuova funzione
                                                            className="font-medium text-slate-500 hover:text-rose-600 transition-colors"
                                                        >
                                                            Elimina
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-16 text-center">
                                                    <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-sm font-medium text-slate-900">Nessun prodotto trovato</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Prova a modificare i filtri o la ricerca.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {meta.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Pagina <span className="font-semibold text-slate-900">{meta.current_page}</span> di {meta.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={meta.current_page === 1}
                                            onClick={() => changePage(meta.current_page - 1)}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        >
                                            Precedente
                                        </button>
                                        <button 
                                            disabled={meta.current_page === meta.last_page}
                                            onClick={() => changePage(meta.current_page + 1)}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        >
                                            Successivo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Modal Product Form */}
            {isFormOpen && (
                <ProductForm 
                    productId={editingId} 
                    onSuccess={handleFormSuccess} 
                    onCancel={() => setIsFormOpen(false)} 
                />
            )}

            {/* Modal Delete Confirmation */}
            <DeleteModal 
                isOpen={deleteModal.isOpen}
                productName={deleteModal.productName}
                onClose={() => setDeleteModal({...deleteModal, isOpen: false})}
                onConfirm={confirmDelete}
            />
        </div>
    );
}