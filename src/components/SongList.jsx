// src/components/SongList.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import '../styles/songlist.css';

const SongList = () => {
  return (
    <div className="song-list">
      <h3 className="text-white">Songs</h3>
      <div className="song-cards">
        <Card className="song-card bg-dark text-white">
          <Card.Body>
            <Card.Title>Song Title</Card.Title>
            <Card.Text>Artist Name</Card.Text>
          </Card.Body>
        </Card>
        {/* Add more song cards here */}
      </div>
    </div>
  );
};

export default SongList;
