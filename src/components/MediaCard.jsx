// src/components/MediaCard.jsx
import React from 'react';
import { FaPlay } from 'react-icons/fa'; // For the play button
import '../styles/mediaCard.css'; // Create this CSS file

const MediaCard = ({ title, subtitle, image, type = 'square' }) => { // Default type is square
  const isArtist = type === 'round'; // Helper for conditional class

  return (
    <div className={`media-card ${isArtist ? 'artist-card' : ''}`}>
      <div className="card-image-container">
        <img src={image} alt={title} className={`card-image ${isArtist ? 'round-image' : ''}`} />
        <button className="m-play-button" aria-label={`Play ${title}`}>
          <FaPlay />
        </button>
      </div>
      <div className="card-text">
        <div className="card-title">{title}</div>
        <div className="card-subtitle">{subtitle}</div>
      </div>
    </div>
  );
};

export default MediaCard;