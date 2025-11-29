import React, { useState, useEffect, useCallback } from 'react'; // Aggiunto useCallback
import api from '../services/api';
import ProductForm from './ProductForm'; // <--- 1. Importiamo il Form

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
    // --- STATI DATI ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [meta, setMeta] = useState({});

    // --- STATI MODALE (Nuovi) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // --- STATI FILTRI ---
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const [filters, setFilters] = useState({
        category_id: '',
        min_price: '',
        sort_by: 'created_at',
        sort_dir: 'desc',
        page: 1
    });

    // Caricamento Categorie
    useEffect(() => {
        api.getCategories().then(res => setCategories(res.data));
    }, []);

    // --- FUNZIONE FETCH (Spostata fuori per poterla riusare) ---
    // Usiamo useCallback per evitare che la funzione venga ricreata a ogni render
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                ...filters,
                search: debouncedSearch,
            };

            // Pulizia parametri
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

    // Trigger Fetch quando cambiano i filtri
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); 

    // --- HANDLERS (Gestori Eventi) ---

    // 1. Apertura Modale (Creazione)
    const handleCreate = () => {
        setEditingId(null); // ID null = Creazione
        setIsModalOpen(true);
    };

    // 2. Apertura Modale (Modifica)
    const handleEdit = (id) => {
        setEditingId(id); // ID presente = Modifica
        setIsModalOpen(true);
    };

    // 3. Cancellazione
    const handleDelete = async (id) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo prodotto?")) return;

        try {
            await api.deleteProduct(id);
            fetchProducts(); // Ricarica la lista dopo la cancellazione
        } catch (error) {
            alert("Errore durante l'eliminazione");
        }
    };

    // 4. Callback dopo salvataggio (chiudi e aggiorna)
    const handleFormSuccess = () => {
        setIsModalOpen(false);
        fetchProducts(); // Ricarica la lista per vedere le modifiche
    };

    // Gestori UI Filtri
    const handleSearch = (e) => setSearchTerm(e.target.value);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Catalogo Prodotti</h1>
                {/* Bottone Nuovo Prodotto collegato */}
                <button 
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    + Nuovo Prodotto
                </button>
            </div>

            {/* Filtri */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                    type="text" 
                    placeholder="Cerca..." 
                    className="border p-2 rounded"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <select name="category_id" className="border p-2 rounded" value={filters.category_id} onChange={handleFilterChange}>
                    <option value="">Tutte le Categorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                    type="number" 
                    name="min_price"
                    placeholder="Min €" 
                    className="border p-2 rounded"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                />
                <select name="sort_by" className="border p-2 rounded" value={filters.sort_by} onChange={handleFilterChange}>
                    <option value="created_at">Più recenti</option>
                    <option value="price">Prezzo</option>
                    <option value="name">Nome</option>
                </select>
            </div>

            {/* Tabella */}
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
                                <th className="p-4">Azioni</th>
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
                                        {p.tags?.map((t, i) => (
                                            <span key={i} className="mr-1 text-gray-500 text-xs bg-gray-100 px-1 rounded">#{t}</span>
                                        ))}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {/* Bottoni Modifica / Elimina Collegati */}
                                        <button 
                                            onClick={() => handleEdit(p.id)}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">Nessun prodotto trovato.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Paginazione */}
                    {meta.last_page > 1 && (
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
                    )}
                </div>
            )}

            {/* MODALE DI CREAZIONE/MODIFICA */}
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