import React, { useState } from 'react';
import '../styles/rightcontrols.css';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  FaHeadphones,
  FaVolumeUp,
  FaExpand,
  FaDesktop,
  FaListUl,
} from 'react-icons/fa';
import { PiMicrophoneStageLight, PiMonitorPlayBold } from 'react-icons/pi';
import { HiOutlineQueueList } from "react-icons/hi2";
import { CiHeadphones } from "react-icons/ci";
import { HiMiniSpeakerWave } from 'react-icons/hi2';
import { CgMiniPlayer } from "react-icons/cg";


const RightControls = ({ volume, onVolumeChange }) => {
  const [activeBtn, setActiveBtn] = useState(null);

  const controls = [
    { id: 'nowplaying', icon: <PiMonitorPlayBold size={23} />, tooltip: 'Now Playing View' },
    { id: 'lyrics', icon: <PiMicrophoneStageLight size={23} />, tooltip: 'Lyrics' },
    { id: 'queue', icon: <HiOutlineQueueList size={23} />, tooltip: 'Queue' },
    { id: 'connect', icon: <FaHeadphones size={23} />, tooltip: 'Connect to a device' },
    { id: 'miniplayer', icon: <CgMiniPlayer size={23} />, tooltip: 'Miniplayer' },
    { id: 'fullscreen', icon: <FaExpand size={23} />, tooltip: 'Fullscreen' },
  ];

  const handleClick = (id) => {
    setActiveBtn(id === activeBtn ? null : id); // toggle active
  };

  return (
    <div className="right-controls-wrapper">
      <div className="right-controls">
        {controls.slice(0, 4).map(({ id, icon, tooltip }) => (
          <OverlayTrigger key={id} placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button
              variant="link"
              className={`icon-btn ${activeBtn === id ? 'active' : ''}`}
              onClick={() => handleClick(id)}
            >
              {icon}
            </Button>
          </OverlayTrigger>
        ))}
  
        <div className="volume-wrapper">
          <HiMiniSpeakerWave size={23} className="volume-icon" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={onVolumeChange}
            className="volume-slider"
          />
        </div>
  
        {controls.slice(4).map(({ id, icon, tooltip }) => (
          <OverlayTrigger key={id} placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button
              variant="link"
              className={`icon-btn ${activeBtn === id ? 'active' : ''}`}
              onClick={() => handleClick(id)}
            >
              {icon}
            </Button>
          </OverlayTrigger>
        ))}
      </div>
    </div>
  );
  
};

export default RightControls;
