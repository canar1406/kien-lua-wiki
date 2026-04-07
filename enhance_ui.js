const fs = require('fs');

const cssContent = `
/* =========================================================================
   GORGEOUS NAVBAR & FOOTER STYLES
   ========================================================================= */

/* --- NAVBAR ENHANCEMENTS --- */
.navbar {
  background-color: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(225, 29, 72, 0.1) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03) !important;
}

[data-theme='dark'] .navbar {
  background-color: rgba(10, 10, 10, 0.8) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5) !important;
}

/* Navbar Title */
.navbar__title {
  font-weight: 900 !important;
  background: linear-gradient(to right, #dc2626, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
}

[data-theme='dark'] .navbar__title {
  background: linear-gradient(to right, #ef4444, #fb7185);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Navbar Links Hover */
.navbar__item {
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.navbar__link:hover {
  color: #dc2626 !important;
}

[data-theme='dark'] .navbar__link:hover {
  color: #ef4444 !important;
}

/* Active Navbar Link */
.navbar__link--active {
  color: #dc2626 !important;
}

[data-theme='dark'] .navbar__link--active {
  color: #ef4444 !important;
}

/* Beautiful Pill Hover Effect for Links */
.navbar__link::after {
  display: none !important;
}

.navbar__link:hover, .navbar__link--active {
  background-color: rgba(225, 29, 72, 0.08) !important;
}
[data-theme='dark'] .navbar__link:hover, [data-theme='dark'] .navbar__link--active {
  background-color: rgba(239, 68, 68, 0.1) !important;
}

/* --- FOOTER ENHANCEMENTS --- */
.footer {
  background: linear-gradient(to bottom, #fff, #fff1f2) !important;
  border-top: 1px solid rgba(225, 29, 72, 0.1) !important;
  padding: 4rem 0 !important;
  color: #404040 !important;
}

[data-theme='dark'] .footer {
  background: linear-gradient(to bottom, #0a0a0a, #000) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #a3a3a3 !important;
}

/* Footer Titles */
.footer__title {
  font-weight: 800 !important;
  font-size: 1.1rem !important;
  color: #171717 !important;
  margin-bottom: 1.5rem !important;
  position: relative;
  display: inline-block;
}

.footer__title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 24px;
  height: 3px;
  background-color: #dc2626;
  border-radius: 2px;
}

[data-theme='dark'] .footer__title {
  color: #fff !important;
}

[data-theme='dark'] .footer__title::after {
  background-color: #ef4444;
}

/* Footer Links */
.footer__link-item {
  color: #525252 !important;
  font-weight: 500 !important;
  padding: 6px 0 !important;
  display: inline-block;
  transition: all 0.3s ease !important;
}

.footer__link-item:hover {
  color: #dc2626 !important;
  transform: translateX(6px) !important;
}

[data-theme='dark'] .footer__link-item {
  color: #a3a3a3 !important;
}

[data-theme='dark'] .footer__link-item:hover {
  color: #ef4444 !important;
}

/* Footer Copyright */
.footer__copyright {
  margin-top: 3rem !important;
  padding-top: 1.5rem !important;
  border-top: 1px solid rgba(225, 29, 72, 0.1) !important;
  font-size: 0.95rem !important;
  color: #737373 !important;
  font-weight: 500 !important;
}

[data-theme='dark'] .footer__copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #525252 !important;
}
`;

fs.appendFileSync('src/css/custom.css', cssContent, 'utf8');

// Modify config to strictly rely on the beautiful custom CSS (change footer style from dark to light to let CSS do the work uniformly)
let configPath = 'docusaurus.config.js';
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(/style:\s*'dark',/g, "style: 'light',");
fs.writeFileSync(configPath, config, 'utf8');

console.log('Navbar and Footer upgraded to beautiful aesthetic!');
