const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'css', 'custom.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const beautifulAdmonitionCss = `

/* ==========================================================
   BEAUTIFUL ADMONITIONS (TYPORA STYLE GLASSMORPHISM)
   ========================================================== */

/* Dark Mode Admonitions */
html[data-theme='dark'] .theme-admonition {
    background: rgba(30, 30, 35, 0.6) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(225, 29, 72, 0.2) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4) !important;
    position: relative !important;
    overflow: hidden !important;
    margin-bottom: 2rem !important;
    padding: 1.25rem 1.5rem !important;
    transition: all 0.3s ease !important;
}

html[data-theme='dark'] .theme-admonition:hover {
    border-color: rgba(225, 29, 72, 0.5) !important;
    box-shadow: 0 15px 50px rgba(225, 29, 72, 0.15) !important;
    transform: translateY(-2px) !important;
}

/* Colored accent lines */
html[data-theme='dark'] .theme-admonition::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #f43f5e, #9f1239) !important;
    box-shadow: 0 0 15px #f43f5e !important;
}

html[data-theme='dark'] .theme-admonition-note::before { background: linear-gradient(180deg, #fbbf24, #d97706) !important; box-shadow: 0 0 15px #fbbf24 !important; border:none!important; }
html[data-theme='dark'] .theme-admonition-info::before { background: linear-gradient(180deg, #38bdf8, #0284c7) !important; box-shadow: 0 0 15px #38bdf8 !important; }
html[data-theme='dark'] .theme-admonition-tip::before { background: linear-gradient(180deg, #4ade80, #16a34a) !important; box-shadow: 0 0 15px #4ade80 !important; }
html[data-theme='dark'] .theme-admonition-warning::before { background: linear-gradient(180deg, #fb923c, #ea580c) !important; box-shadow: 0 0 15px #fb923c !important; }
html[data-theme='dark'] .theme-admonition-danger::before { background: linear-gradient(180deg, #f87171, #dc2626) !important; box-shadow: 0 0 15px #f87171 !important; }

/* Headings */
html[data-theme='dark'] .theme-admonition [class*="admonitionHeading_"] {
    font-family: var(--ifm-heading-font-family) !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    font-size: 0.95rem !important;
    margin-bottom: 1rem !important;
    display: flex !important;
    align-items: center !important;
    letter-spacing: 0.08em !important;
    color: #e2e8f0 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding-bottom: 0.75rem !important;
}

/* Override title colors */
html[data-theme='dark'] .theme-admonition-note [class*="admonitionHeading_"] { color: #fbbf24 !important; }
html[data-theme='dark'] .theme-admonition-info [class*="admonitionHeading_"] { color: #38bdf8 !important; }
html[data-theme='dark'] .theme-admonition-tip [class*="admonitionHeading_"] { color: #4ade80 !important; }
html[data-theme='dark'] .theme-admonition-warning [class*="admonitionHeading_"] { color: #fb923c !important; }
html[data-theme='dark'] .theme-admonition-danger [class*="admonitionHeading_"] { color: #f87171 !important; }

/* Icons */
html[data-theme='dark'] .theme-admonition [class*="admonitionIcon_"] {
    margin-right: 12px !important;
}
html[data-theme='dark'] .theme-admonition [class*="admonitionIcon_"] svg {
    fill: currentColor !important;
    stroke: currentColor !important;
    width: 20px !important;
    height: 20px !important;
    filter: drop-shadow(0 0 8px currentColor) !important;
}

/* Content */
html[data-theme='dark'] .theme-admonition [class*="admonitionContent_"] {
    color: #cbd5e1 !important;
    font-size: 0.95rem !important;
    line-height: 1.7 !important;
    font-style: italic !important;
}


/* Light Mode Admonitions */
html[data-theme='light'] .theme-admonition {
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
    position: relative !important;
    overflow: hidden !important;
    margin-bottom: 2rem !important;
    padding: 1.25rem 1.5rem !important;
    transition: all 0.3s ease !important;
}

html[data-theme='light'] .theme-admonition:hover {
    border-color: rgba(225, 29, 72, 0.2) !important;
    box-shadow: 0 15px 35px rgba(225, 29, 72, 0.1) !important;
    transform: translateY(-2px) !important;
}

/* Colored accent lines */
html[data-theme='light'] .theme-admonition::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
}

html[data-theme='light'] .theme-admonition-note::before { background: linear-gradient(180deg, #f59e0b, #b45309) !important; }
html[data-theme='light'] .theme-admonition-info::before { background: linear-gradient(180deg, #0ea5e9, #0369a1) !important; }
html[data-theme='light'] .theme-admonition-tip::before { background: linear-gradient(180deg, #22c55e, #15803d) !important; }
html[data-theme='light'] .theme-admonition-warning::before { background: linear-gradient(180deg, #f97316, #c2410c) !important; }
html[data-theme='light'] .theme-admonition-danger::before { background: linear-gradient(180deg, #ef4444, #b91c1c) !important; }

/* Headings */
html[data-theme='light'] .theme-admonition [class*="admonitionHeading_"] {
    font-family: var(--ifm-heading-font-family) !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    font-size: 0.95rem !important;
    margin-bottom: 1rem !important;
    display: flex !important;
    align-items: center !important;
    letter-spacing: 0.08em !important;
    color: #334155 !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
    padding-bottom: 0.75rem !important;
}

html[data-theme='light'] .theme-admonition-note [class*="admonitionHeading_"] { color: #d97706 !important; }
html[data-theme='light'] .theme-admonition-info [class*="admonitionHeading_"] { color: #0284c7 !important; }
html[data-theme='light'] .theme-admonition-tip [class*="admonitionHeading_"] { color: #16a34a !important; }
html[data-theme='light'] .theme-admonition-warning [class*="admonitionHeading_"] { color: #ea580c !important; }
html[data-theme='light'] .theme-admonition-danger [class*="admonitionHeading_"] { color: #dc2626 !important; }

/* Icons */
html[data-theme='light'] .theme-admonition [class*="admonitionIcon_"] {
    margin-right: 12px !important;
}
html[data-theme='light'] .theme-admonition [class*="admonitionIcon_"] svg {
    fill: currentColor !important;
    stroke: currentColor !important;
    width: 20px !important;
    height: 20px !important;
}

/* Content */
html[data-theme='light'] .theme-admonition [class*="admonitionContent_"] {
    color: #475569 !important;
    font-size: 0.95rem !important;
    line-height: 1.7 !important;
    font-style: italic !important;
}

/* Reset inner markdown elements inside Admonition */
html[data-theme='dark'] .theme-admonition [class*="admonitionContent_"] p,
html[data-theme='light'] .theme-admonition [class*="admonitionContent_"] p {
    margin-bottom: 0.5rem !important;
}
html[data-theme='dark'] .theme-admonition [class*="admonitionContent_"] strong {
    color: #f1f5f9 !important;
    font-style: normal !important;
}
html[data-theme='light'] .theme-admonition [class*="admonitionContent_"] strong {
    color: #1e293b !important;
    font-style: normal !important;
}
`;

if (!cssContent.includes("BEAUTIFUL ADMONITIONS")) {
    fs.appendFileSync(cssPath, beautifulAdmonitionCss, 'utf8');
    console.log("Appended beautiful CSS to custom.css");
} else {
    console.log("CSS already contains beautiful admonition styles.");
}
