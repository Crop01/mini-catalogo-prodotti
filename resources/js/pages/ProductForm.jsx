import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProductForm({ productId, onSuccess, onCancel }) {
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category_id: '',
        tags: '' 
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await api.getCategories();
                setCategories(catRes.data);

                if (productId) {
                    const prodRes = await api.getProduct(productId);
                    const p = prodRes.data;
                    setFormData({
                        name: p.name,
                        price: p.price,
                        category_id: p.category_id,
                        tags: p.tags ? p.tags.join(', ') : ''
                    });
                }
            } catch (error) {
                console.error("Error loading form data", error);
            }
        };
        fetchData();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            };

            if (productId) {
                await api.updateProduct(productId, payload);
            } else {
                await api.createProduct(payload);
            }
            onSuccess();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                alert("Si è verificato un errore imprevisto.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm transition-opacity py-10">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border border-slate-100 max-h-full flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {productId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Prodotto</label>
                        <input 
                            type="text" 
                            className={`input-base h-10 text-sm ${errors.name ? '!border-red-300 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                            placeholder="Es. Cuffie Wireless"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Grid Prezzo & Categoria */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Prezzo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 sm:text-sm">€</span>
                                </div>
                                <input 
                                    type="number" step="0.01"
                                    className={`input-base h-10 pl-8 text-sm ${errors.price ? '!border-red-300 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
                            <select 
                                className={`input-base h-10 text-sm bg-white ${errors.category_id ? '!border-red-300 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                                value={formData.category_id}
                                onChange={e => setFormData({...formData, category_id: e.target.value})}
                            >
                                <option value="">Seleziona...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Tags <span className="text-slate-400 font-normal ml-1">(Separati da virgola)</span>
                        </label>
                        <input 
                            type="text" 
                            className="input-base h-10 text-sm"
                            placeholder="promo, nuovo, best-seller"
                            value={formData.tags}
                            onChange={e => setFormData({...formData, tags: e.target.value})}
                        />
                    </div>

                </form>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="px-4 py-2 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                        Annulla
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        onClick={handleSubmit}
                        className="btn-primary h-10 flex items-center gap-2"
                    >
                        {isSaving && (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSaving ? 'Salvataggio...' : 'Salva Prodotto'}
                    </button>
                </div>
            </div>
        </div>
    );
}