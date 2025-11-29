import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProductForm({ productId, onSuccess, onCancel }) {
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    // Stato del form
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category_id: '',
        tags: '' // Gestiamo i tag come stringa separata da virgole nel form
    });

    // 1. Carica le categorie (e il prodotto se siamo in modifica)
    useEffect(() => {
        api.getCategories().then(res => setCategories(res.data));

        if (productId) {
            api.getProduct(productId).then(res => {
                const p = res.data;
                setFormData({
                    name: p.name,
                    price: p.price,
                    category_id: p.category_id,
                    tags: p.tags ? p.tags.join(', ') : '' // Converti array in stringa "tag1, tag2"
                });
            });
        }
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSaving(true);

        try {
            // Prepara i dati (converti tags da stringa a array)
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            };

            if (productId) {
                await api.updateProduct(productId, payload);
            } else {
                await api.createProduct(payload);
            }
            
            onSuccess(); // Torna alla lista
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Errori di validazione Laravel
                setErrors(error.response.data.errors);
            } else {
                alert("Si è verificato un errore imprevisto.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">
                    {productId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Nome */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded mt-1"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Prezzo e Categoria */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prezzo (€)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full border p-2 rounded mt-1"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select 
                                className="w-full border p-2 rounded mt-1"
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
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Tags (separati da virgola)</label>
                        <input 
                            type="text" 
                            placeholder="es. promo, nuovo, estate"
                            className="w-full border p-2 rounded mt-1"
                            value={formData.tags}
                            onChange={e => setFormData({...formData, tags: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Inserisci i tag separati da una virgola.</p>
                    </div>

                    {/* Bottoni */}
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Salvataggio...' : 'Salva Prodotto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}