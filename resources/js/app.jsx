import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <h1>
            Prova
        </h1>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);