// src/components/MainPage.tsx
import React, { useState, useEffect } from 'react';

// Définition du type pour un livre
interface Book {
    id: number;
    title: string;
    author: string;
    stars: string;
    description: string;
}

const MainPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        // Fetch des données depuis notre backend Node.js
        fetch('http://localhost:3001/api/books')
            .then(response => response.json())
            .then(data => setBooks(data))
            .catch(error => console.error("Erreur lors de la récupération des livres:", error));
    }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois, au montage.

    return (
        <div className="page" id="main-page">
            <header className="main-header">
                {/* Icônes SVG du header */}
            </header>
            <main className="main-content">
                <h2>Let's discuss this book?</h2>
                <p>Your community is near {/* SVG */}</p>
                <ul className="book-list">
                    {books.map(book => (
                        <li key={book.id} className="book-item">
                            <div className="book-item-icon">{/* Mettre un SVG ici basé sur book.icon */}</div>
                            <div className="book-item-details">
                                <h3>{book.title}</h3>
                                <div className="author">{book.author}</div>
                                <div className="stars">{book.stars}</div>
                                <div className="description">{book.description}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
            <footer className="main-footer">
                {/* Icônes SVG du footer */}
            </footer>
        </div>
    );
};

export default MainPage;
