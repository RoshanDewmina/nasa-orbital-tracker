import React from 'react';
import Orrery from './Orrery';
import Header from './Header'; // Import the Header component
import './App.css';

const App = () => {
    return (
        <div className="App">
            <Header />
            <Orrery />
        </div>
    );
};

export default App;
