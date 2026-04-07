const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'css', 'custom.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const mappingCss = `

/* ==========================================================
   KHÔI PHỤC CSS GỐC CỦA PHYCAT-ABYSS CHO DOCUSAURUS ADMONITIONS
   ========================================================== */

/* Kế thừa toàn bộ form của .md-alert từ phycat-abyss.css */
html .theme-admonition {
    padding: 12px 16px !important;
    margin-bottom: 16px !important;
    color: var(--text-color) !important;
    border: 1px solid transparent !important;
    border-radius: 12px !important;
    background-color: rgba(255, 255, 255, .02) !important;
    position: relative !important;
    overflow: hidden !important;
    transition: transform .3s cubic-bezier(.34, 1.56, .64, 1), box-shadow .3s ease, border-color .3s ease, background-color .3s ease !important;
    box-shadow: none !important;
}

/* Background Emoji ảo ảnh xoay mờ */
html .theme-admonition::after {
    position: absolute !important;
    right: -10px !important;
    bottom: -15px !important;
    font-family: "Segoe UI Emoji", "Apple Color Emoji", sans-serif !important;
    font-size: 64px !important;
    line-height: 1 !important;
    opacity: .15 !important;
    transform: rotate(-15deg) !important;
    pointer-events: none !important;
    z-index: 0 !important;
    filter: grayscale(100%) !important;
    text-shadow: 0 0 10px currentColor !important;
    transition: transform .4s cubic-bezier(.34, 1.56, .64, 1), opacity .4s ease, right .4s ease, bottom .4s ease, filter .4s ease, text-shadow .4s ease !important;
    background: transparent !important;
    width: auto !important; height: auto !important; box-shadow: none !important;
}

html .theme-admonition:hover {
    transform: scale(1.01) translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .2) !important;
    z-index: 1 !important;
}

html .theme-admonition:hover::after {
    transform: rotate(0) scale(1.1) !important;
    opacity: .25 !important;
    right: 5px !important;
    bottom: -5px !important;
    filter: grayscale(0) !important;
    text-shadow: 0 0 25px currentColor !important;
}

/* Header Text Container (Trôn vào cái vỏ của phycat) */
html .theme-admonition [class*="admonitionHeading_"] {
    display: inline-flex !important;
    align-items: center !important;
    margin-bottom: 8px !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    position: relative !important;
    z-index: 2 !important;
    background-color: rgba(255, 255, 255, .06) !important;
    border: 1px solid rgba(255, 255, 255, .1) !important;
    padding: 4px 10px !important;
    border-radius: 50px !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .1) !important;
    text-transform: capitalize !important;
}

html .theme-admonition [class*="admonitionIcon_"] svg {
    fill: currentColor !important;
    position: relative !important;
    top: 1px !important;
    margin-right: 5px !important;
    width: 1em !important;
    height: 1em !important;
}

/* Đảm bảo nội dung nổi lên trên hiệu ứng Emoji */
html .theme-admonition [class*="admonitionContent_"] {
    position: relative !important;
    z-index: 2 !important;
    color: inherit !important;
}
html .theme-admonition [class*="admonitionContent_"] p { margin-bottom: 0.5em !important; }

/* -------------------------------------------------------------
   MAPPING CÁC LOẠI ADMONITIONS SANG CHUẨN PHYCAT-ABYSS
------------------------------------------------------------- */
/* NOTE (Tím nhạt) -> 📝 */
html .theme-admonition-note { border-color: rgba(189, 147, 249, .3) !important; background-color: rgba(189, 147, 249, .05) !important; }
html .theme-admonition-note:hover { box-shadow: 0 4px 20px rgba(189, 147, 249, .15) !important; border-color: var(--secondary-color) !important; }
html .theme-admonition-note [class*="admonitionHeading_"] { color: var(--secondary-color) !important; }
html .theme-admonition-note::after { content: "📝" !important; color: var(--secondary-color) !important; }

/* INFO / TIP (Xanh lơ) -> 💡 */
html .theme-admonition-info, html .theme-admonition-tip { border-color: rgba(139, 233, 253, .3) !important; background-color: rgba(139, 233, 253, .05) !important; }
html .theme-admonition-info:hover, html .theme-admonition-tip:hover { box-shadow: 0 4px 20px rgba(139, 233, 253, .15) !important; border-color: var(--accent-color) !important; }
html .theme-admonition-info [class*="admonitionHeading_"], html .theme-admonition-tip [class*="admonitionHeading_"] { color: var(--accent-color) !important; }
html .theme-admonition-info::after, html .theme-admonition-tip::after { content: "💡" !important; color: var(--accent-color) !important; }

/* WARNING (Cam) -> ⚠️ */
html .theme-admonition-warning { border-color: rgba(255, 184, 108, .3) !important; background-color: rgba(255, 184, 108, .05) !important; }
html .theme-admonition-warning:hover { box-shadow: 0 4px 20px rgba(255, 184, 108, .15) !important; border-color: #ffb86c !important; }
html .theme-admonition-warning [class*="admonitionHeading_"] { color: #ffb86c !important; }
html .theme-admonition-warning::after { content: "⚠️" !important; color: #ffb86c !important; }

/* DANGER (Đỏ) -> 🔥/💀 */
html .theme-admonition-danger { border-color: rgba(214, 48, 49, .3) !important; background-color: rgba(214, 48, 49, .05) !important; }
html .theme-admonition-danger:hover { box-shadow: 0 4px 20px rgba(214, 48, 49, .15) !important; border-color: #d63031 !important; }
html .theme-admonition-danger [class*="admonitionHeading_"] { color: #d63031 !important; }
html .theme-admonition-danger::after { content: "💀" !important; color: #d63031 !important; }
`;

if (!cssContent.includes("KẾT NỐI DOCUSAURUS ADMONITIONS VỚI PHYCAT-ABYSS")) {
    fs.appendFileSync(cssPath, mappingCss, 'utf8');
    console.log("Khôi phục thành công UI md-alert gốc của Phycat Abyss!");
} else {
    console.log("Đã được tích hợp trước đó.");
}
