// src/components/HomePageSections.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Or your preferred icon library
import '../styles/homePageSections.css';

const Section = ({ title, children, showAllLink = "#" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const cardGridRef = useRef(null);

  // Function to check scroll position and update arrow visibility
  const checkScroll = () => {
    const container = cardGridRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Show left arrow if not scrolled all the way to the left
    setShowLeftArrow(scrollLeft > 1); // Use a small tolerance

    // Show right arrow if not scrolled all the way to the right
    // Add tolerance (e.g., 1px) for potential floating point inaccuracies
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Effect to check scroll on mount and when children change
  useEffect(() => {
    checkScroll();
    // Add resize listener to re-check on window resize
    window.addEventListener('resize', checkScroll);
    // Optional: If children can change dynamically, might need MutationObserver or dependency array update
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]); // Re-run if children change might be needed depending on app structure

  const handleScroll = (direction) => {
    const container = cardGridRef.current;
    if (!container) return;

    // Calculate scroll amount (e.g., scroll by 80% of the container width)
    const scrollAmount = container.clientWidth * 0.8;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    // Check scroll again shortly after scroll starts to update arrows accurately
    // Smooth scroll takes time, so setTimeout helps update state after animation begins
    setTimeout(checkScroll, 300); // Adjust timing if needed
  };

  // --- Event Handlers for Hover ---
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <section
      className="spotify-section"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="section-header">
        <h2 className="section-title">
          <a href="#" className="title-link">{title}</a>
        </h2>
        {/* Conditionally render "Show all" only if there are items */}
        {showAllLink && React.Children.count(children) > 0 && (
          <a href={showAllLink} className="show-all-link">
            Show all
          </a>
        )}
      </div>

      <div className="section-content"> {/* Added wrapper for positioning arrows */}
        {/* Left Scroll Arrow */}
        {isHovered && showLeftArrow && (
          <button
            className="scroll-arrow left-arrow"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Card Grid - Now Horizontal and Scrollable */}
        <div
          className="card-grid"
          ref={cardGridRef}
          onScroll={checkScroll} // Update arrows during manual scroll (e.g., trackpad)
        >
          {children}
        </div>

        {/* Right Scroll Arrow */}
        {/* The user request was specifically for the right arrow on hover */}
        {/* We show it if hovered AND if scrolling right is possible */}
        {isHovered && showRightArrow && (
          <button
            className="scroll-arrow right-arrow"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
};

export default Section;