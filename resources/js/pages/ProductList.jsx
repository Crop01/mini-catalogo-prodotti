import React, { useState, useEffect, useCallback } from 'react'; // added useCallback
import api from '../services/api';
import ProductForm from './ProductForm';
import DeleteModal from './DeleteModal';

// Utility to generate a color from a string (for tags)
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Utility to get initials from product name (for avatar)
const getInitials = (name) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

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
        <div className="min-h-screen bg-slate-50 font-sans">
            
            {/* 1. Header*/}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 pb-32 pt-10 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Mini Catalogo</h1>
                                <p className="text-indigo-100 text-sm mt-0.5 font-medium">Dashboard Gestione Prodotti</p>
                            </div>
                        </div>
                        <button onClick={handleCreate} className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Nuovo Prodotto
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                
                {/* 2. Filters */}
                <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input type="text" placeholder="Cerca nel catalogo..." className="input-base pl-10" value={searchTerm} onChange={handleSearch} />
                    </div>

                    <select name="category_id" className="input-base cursor-pointer" value={filters.category_id} onChange={handleFilterChange}>
                        <option value="">Tutte le Categorie</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.products_count})
                            </option>
                        ))}
                    </select>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-indigo-500 font-medium">€</span>
                        </div>
                        <input type="number" name="min_price" placeholder="Prezzo Minimo" className="input-base pl-8" value={filters.min_price} onChange={handleFilterChange} />
                    </div>

                    <select name="sort_by" className="input-base cursor-pointer" value={filters.sort_by} onChange={handleFilterChange}>
                        <option value="created_at">📅 Più recenti</option>
                        <option value="price">💰 Prezzo</option>
                        <option value="name">🔤 Nome (A-Z)</option>
                    </select>
                </div>

                {/* 3. Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                    {isLoading ? (
                        <div className="p-6 space-y-6 animate-pulse">
                             {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-6 border-b border-slate-50 pb-6 last:border-0">
                                    <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                            <th className="px-6 py-4">Prodotto</th>
                                            <th className="px-6 py-4">Categoria</th>
                                            <th className="px-6 py-4">Prezzo</th>
                                            <th className="px-6 py-4">Etichette</th>
                                            <th className="px-6 py-4 text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {products.length > 0 ? products.map(p => (
                                            <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors duration-150 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        {/* AVATAR GENERATO */}
                                                        <div 
                                                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                                                            style={{ backgroundColor: stringToColor(p.name) }}
                                                        >
                                                            {getInitials(p.name)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-800">{p.name}</div>
                                                            <div className="text-xs text-slate-400 font-mono mt-0.5">#{String(p.id).padStart(4, '0')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        {p.category?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-slate-700 tabular-nums">
                                                    € {Number(p.price).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {p.tags?.map((t, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(p.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Modifica">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(p)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Elimina">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-slate-900">Nessun prodotto trovato</h3>
                                                    <p className="text-slate-500 mt-1 max-w-xs mx-auto">Non ci sono prodotti che corrispondono ai filtri selezionati.</p>
                                                    <button onClick={() => setFilters({...filters, search: '', category_id: '', min_price: ''})} className="mt-4 text-indigo-600 font-medium hover:underline">
                                                        Resetta filtri
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            {meta.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <div className="text-sm text-slate-500">
                                        Pagina <span className="font-bold text-slate-900">{meta.current_page}</span> di {meta.last_page}
                                    </div>
                                    <div className="flex gap-2">
                                        <button disabled={meta.current_page === 1} onClick={() => changePage(meta.current_page - 1)} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                            ← Precedente
                                        </button>
                                        <button disabled={meta.current_page === meta.last_page} onClick={() => changePage(meta.current_page + 1)} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                            Successivo →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isFormOpen && <ProductForm productId={editingId} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />}
            <DeleteModal isOpen={deleteModal.isOpen} productName={deleteModal.productName} onClose={() => setDeleteModal({...deleteModal, isOpen: false})} onConfirm={confirmDelete} />
        </div>
    );
}