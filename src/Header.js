// src/Header.js
import React, { useState } from 'react';
import './Header.css'; // Ensure this path is correct

const Header = () => {
    const [isVisible, setIsVisible] = useState(true);

    const toggleHeader = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div>
            <header className={`header ${isVisible ? 'visible' : 'hidden'}`}>
                <h1 style={{ color: 'white', margin: 0 }}>Interactive Orrery</h1>
            </header>
            <button onClick={toggleHeader} className="toggle-button">
                {isVisible ? '▼' : '▲'} {/* Using arrows for the button */}
            </button>
        </div>
    );
};

export default Header;
