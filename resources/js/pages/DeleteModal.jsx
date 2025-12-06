import React from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm, productName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-100">
                
                <div className="p-6 text-center">
                    {/* Icona di Pericolo Animata */}
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900">
                        Elimina Prodotto
                    </h3>
                    
                    <p className="text-sm text-slate-500 mt-2">
                        Sei sicuro di voler eliminare <span className="font-bold text-slate-800">"{productName}"</span>?
                        <br/>L'azione non può essere annullata.
                    </p>
                </div>

                {/* Footer Bottoni */}
                <div className="bg-slate-50/50 px-6 py-4 flex justify-center gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm transition-colors"
                    >
                        Sì, Elimina
                    </button>
                </div>
            </div>
        </div>
    );
}