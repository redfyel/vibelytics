// src/components/MoodForecastModal.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import MoodForecast from './MoodForecast';
import '../styles/moodForecast.css'; // Import the CSS

const MoodForecastModal = ({ show, handleClose }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
      dialogClassName="mood-modal-spotifyish" // Add custom class here
    >
      {/* Keep header/body structure */}
      <Modal.Header closeButton>
        <Modal.Title>Get insights into your mood from your recent listening activity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MoodForecast />
      </Modal.Body>
    </Modal>
  );
};

export default MoodForecastModal;