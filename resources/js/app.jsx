import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductList from './pages/ProductList';

function App() {
    return (
        <div className="bg-gray-100 min-h-screen text-gray-900">
             {/* In the future, I will add the Router here, for now I show the list directly */}
            <ProductList />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);