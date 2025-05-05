// src/components/TopGridCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa'; // Play icon
import '../styles/topGridCard.css'; // Create this CSS file


const TopGridCard = ({ item }) => {
    if (!item) return null;

    // Adapt based on your data structure (playlist, album, artist, track?)
    const imageUrl = item.image || item.images?.[0]?.url || item.album?.images?.[0]?.url || 'default-image-url.jpg';
    const title = item.title || item.name || 'Unknown Item';
    const itemType = item.type || 'playlist'; 
    const linkUrl = `/${itemType}/${item.id}`;

    return (
        <Link to={linkUrl} className="top-grid-card">
            <img
                src={imageUrl}
                alt={title}
                className="top-grid-card-image"
            />
            <span className="top-grid-card-title">{title}</span>
            <button className="tplay-button" aria-label={`Play ${title}`}>
                <FaPlay size={16} />
            </button>
        </Link>
    );
};

export default TopGridCard;