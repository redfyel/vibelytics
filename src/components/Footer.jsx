// src/components/Footer.jsx
import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa'; // Import icons
import '../styles/footer.css'; // Make sure CSS path is correct

const Footer = () => {
  return (
    <footer className="spotify-footer">
      <div className="footer-content">
        {/* Link Columns */}
        <div className="footer-links-container">
          <div className="footer-column">
            <h5 className="footer-heading">Company</h5>
            <ul className="footer-list">
              <li><a href="#">About</a></li>
              <li><a href="#">Jobs</a></li>
              <li><a href="#">For the Record</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h5 className="footer-heading">Communities</h5>
            <ul className="footer-list">
              <li><a href="#">For Artists</a></li>
              <li><a href="#">Developers</a></li>
              <li><a href="#">Advertising</a></li>
              <li><a href="#">Investors</a></li>
              <li><a href="#">Vendors</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h5 className="footer-heading">Useful links</h5>
            <ul className="footer-list">
              <li><a href="#">Support</a></li>
              <li><a href="#">Free Mobile App</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h5 className="footer-heading">Spotify Plans</h5>
            <ul className="footer-list">
              <li><a href="#">Premium Individual</a></li>
              <li><a href="#">Premium Duo</a></li>
              <li><a href="#">Premium Family</a></li>
              <li><a href="#">Premium Student</a></li>
              <li><a href="#">Spotify Free</a></li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="footer-socials">
          <a href="#" aria-label="Instagram" className="social-icon-link">
            <FaInstagram />
          </a>
          <a href="#" aria-label="Twitter" className="social-icon-link">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Facebook" className="social-icon-link">
            <FaFacebookF />
          </a>
        </div>
      </div>

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        {/* Get current year dynamically */}
        <p className="copyright-text">© {new Date().getFullYear()} Spotify AB</p>
      </div>
    </footer>
  );
};

export default Footer;