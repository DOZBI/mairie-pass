// src/components/WelcomePage.tsx
import React from 'react';

// Définition des props avec TypeScript
interface WelcomePageProps {
  onGoClick: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onGoClick }) => {
  return (
    <div className="page" id="welcome-page">
      <header className="welcome-header">
        {/* Icônes de documentation (comme dans votre dernier code) */}
      </header>
      <main className="welcome-content">
        <h1>Welcome to the new world</h1>
        <p>This is an online club for book readers...</p>
      </main>
      <footer className="welcome-footer">
        <button id="go-button" onClick={onGoClick}>LET'S GO</button>
        <svg id="squiggle-line" width="100" height="20" viewBox="0 0 100 20" fill="none">
            <path d="M2 10.5C15.6667 2.5 34.6 -4.9 50.5 10.5C66.4 25.9 83.5 11.1667 98 10.5"/>
        </svg>
      </footer>
    </div>
  );
};

export default WelcomePage;
