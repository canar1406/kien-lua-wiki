const fs = require('fs');

function processCss(filePath, theme) {
    let css = fs.readFileSync(filePath, 'utf8');

    // Revert previous injections if run multiple times
    css = css.replace(new RegExp(`,\\s*html\\[data-theme='${theme}'\\] \\.markdown \\.theme-admonition[^\\{]*`, "g"), "");

    // Inject .theme-admonition
    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote,\nhtml[data-theme='${theme}'] .markdown .theme-admonition {`);
        
    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote::before \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote::before,\nhtml[data-theme='${theme}'] .markdown .theme-admonition::before {`);
        
    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote p \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote p,\nhtml[data-theme='${theme}'] .markdown .theme-admonition p {`);
        
    // In abyss it has multiple grouped pseudo classes:
    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote:hover \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote:hover,\nhtml[data-theme='${theme}'] .markdown .theme-admonition:hover {`);

    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote:hover::before \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote:hover::before,\nhtml[data-theme='${theme}'] .markdown .theme-admonition:hover::before {`);

    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote p:last-child \\{`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote p:last-child,\nhtml[data-theme='${theme}'] .markdown .theme-admonition p:last-child {`);

    // Fix inline "font-style: italic" definition
    css = css.replace(new RegExp(`html\\[data-theme='${theme}'\\] \\.markdown blockquote p \\{ font-style`, "g"),
        `html[data-theme='${theme}'] .markdown blockquote p, html[data-theme='${theme}'] .markdown .theme-admonition p { font-style`);

    fs.writeFileSync(filePath, css, 'utf8');
}

processCss('src/css/phycat-abyss.css', 'dark');
processCss('src/css/phycat-sky.css', 'light');

// Now, properly link the styles and hide the Docusaurus-native Admonition Heading
const customCssPath = 'src/css/custom.css';
let customCss = fs.readFileSync(customCssPath, 'utf8');

// Also remove any big manual blocks from previous "tự build css" attempts
customCss = customCss.replace(/\/\* ==========================================================\s*KHÔI PHỤC CSS GỐC CỦA PHYCAT[\s\S]*?(?:KẾT NỐI DOCUSAURUS ADMONITIONS VỚI PHYCAT-ABYSS|appended beautiful CSS|BEAUTIFUL ADMONITIONS).*$/g, '');

const admonitionHideHeading = `
/* ---------------------------------------------------------
   MAPPING ADMONITION (CHỈ SỬ DỤNG CSS CỦA THEME GỐC)
   --------------------------------------------------------- */
/* Ẩn tiêu đề và icon gốc của Docusaurus để nhường chỗ cho ::before icon của Theme Gốc */
html .markdown .theme-admonition [class^="admonitionHeading_"] {
    display: none !important;
}

/* Đảm bảo nội dung hiển thị chuẩn trên nền blockquote */
html .markdown .theme-admonition [class^="admonitionContent_"] {
    display: block;
    width: 100%;
}

/* Xóa bỏ default margin padding của admonition để dựa hoàn toàn vào blockquote */
html .markdown .theme-admonition {
    margin-top: 1rem;
    margin-bottom: 1rem;
}
`;

if (!customCss.includes("MAPPING ADMONITION (CHỈ SỬ DỤNG CSS CỦA THEME GỐC)")) {
    customCss += admonitionHideHeading;
}

fs.writeFileSync(customCssPath, customCss, 'utf8');
console.log("Successfully mapped selectors directly from phycat-abyss and phycat-sky.");
