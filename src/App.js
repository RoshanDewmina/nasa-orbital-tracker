// src/App.js
import React from 'react';
import Orrery from './Orrery';
import './App.css';

const App = () => {
    return (
        <div className="App">
            <h1 style={{ color: 'white' }}>Interactive Orrery</h1>
            <Orrery />
        </div>
    );
};

export default App;
