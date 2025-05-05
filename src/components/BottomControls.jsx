import React, { useState, useRef, useEffect } from "react";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import RightControls from "./RightControls";
import "../styles/bottomcontrols.css";
import { BsShuffle } from "react-icons/bs";
import { IoIosArrowUp } from "react-icons/io";
import { SlLoop } from "react-icons/sl";
import { TbPlayerSkipBackFilled } from "react-icons/tb";
import { TbPlayerSkipForwardFilled } from "react-icons/tb";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};


const BottomControls = () => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(70);

  const totalDurationSeconds = 225; 
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(progress / 100 * totalDurationSeconds);

  const sliderRef = useRef(null); 

  const handlePlayPause = () => {
    setPlaying(!playing);
    //  logic to actually play/pause audio 
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
     //  logic to set audio volume 
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    const newTime = (newProgress / 100) * totalDurationSeconds;
    setCurrentTimeSeconds(newTime);
    //  logic to seek audio position 
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--progress-percent', `${progress}%`);
      setCurrentTimeSeconds(progress / 100 * totalDurationSeconds);
    }
  }, [progress, totalDurationSeconds]);


  useEffect(() => {
    let intervalId;
    if (playing) {
      intervalId = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + (100 / totalDurationSeconds); 
          if (newProgress >= 100) {
            setPlaying(false); 
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId); 
  }, [playing, totalDurationSeconds]);


  return (
    <div className="bottom-controls">
      <div className="controls-wrapper">
        {/* Left Section */}
        <div className="left-section">
            <div className="album-wrapper">
            <img
                src="https://archeroracle.org/wp-content/uploads/2023/04/album-cover-3.jpg"
                alt="Album"
                className="album-cover"
            />
            <div className="hover-icon">
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-expand">Expand</Tooltip>}
            >
                <IoIosArrowUp />
                </OverlayTrigger>
            </div>
            </div>

            <div className="song-info">
            <div className="song-name">Song Name</div>
            <div className="artist-name">Artist Name</div>
            </div>

            <div className="left-icon-buttons">
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-hide">Hide</Tooltip>}
            >
                <Button variant="outline-light" className="left-circle-icon-btn">
                −
                </Button>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-like">Add to Liked Songs</Tooltip>}
            >
                <Button variant="outline-light" className="left-circle-icon-btn">
                +
                </Button>
            </OverlayTrigger>
            </div>
        </div>


        {/* Center Section */}
        <div className="center-section">
          <div className="shuffle-controls">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-shuffle">Shuffle</Tooltip>}
            >
              <Button variant="link" className="cent-control-btn shuffle-repeat-btn">
                <BsShuffle />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-previous">Previous</Tooltip>}
            >
              <Button variant="link" className="cent-control-btn prev-next-btn">
                <TbPlayerSkipBackFilled />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-play-pause">
                  {playing ? "Pause" : "Play"}
                </Tooltip>
              }
            >
              <Button
                variant="link"
                className="cent-control-btn play-pause"
                onClick={handlePlayPause}
              >
                  <div className="play-pause-button">
                    {playing ? <FaPause /> : <FaPlay />}
                  </div>
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-next">Next</Tooltip>}
            >
              <Button variant="link" className="cent-control-btn prev-next-btn">
                <TbPlayerSkipForwardFilled />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-loop">Loop</Tooltip>}
            >
              <Button variant="link" className="cent-control-btn shuffle-repeat-btn">
                <SlLoop />
              </Button>
            </OverlayTrigger>
          </div>

          {/* --- Spotify Style Progress Bar --- */}
          <div className="progress-container">
             <span className="time-display current-time">{formatTime(currentTimeSeconds)}</span>
             <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100" 
                value={progress}
                onChange={handleProgressChange}
                className="my-spotify-progress-slider"
                style={{ '--progress-percent': `${progress}%` }} 
             />
             <span className="time-display total-duration">{formatTime(totalDurationSeconds)}</span>
          </div>
        </div>

        {/* Right Section */}
        <RightControls volume={volume} onVolumeChange={handleVolumeChange} />
      </div>
    </div>
  );
};

export default BottomControls;