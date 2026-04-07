const fs = require('fs');

function mapAlerts(file) {
    let css = fs.readFileSync(file, 'utf8');
    
    // Revert our previous incorrect injection where we bound .theme-admonition to blockquote
    css = css.replace(/,\nhtml\[data-theme='(?:dark|light)'\] \.markdown \.theme-admonition[^\{]*\{/g, " {");

    // Replace strict .md-alert occurrences with combined selectors
    css = css.replace(/\.md-alert \{/g, ".md-alert, .markdown-alert {");
    
    // .md-alert-text-container -> .markdown-alert-title
    css = css.replace(/\.md-alert-text-container \{/g, ".md-alert-text-container, .markdown-alert-title {");
    css = css.replace(/\.md-alert-text-container span \{/g, ".md-alert-text-container span, .markdown-alert-title span {");
    css = css.replace(/\.md-alert-text svg \{/g, ".md-alert-text svg, .markdown-alert-title svg {");
    
    // ::after styles
    css = css.replace(/\.md-alert::after \{/g, ".md-alert::after, .markdown-alert::after {");
    css = css.replace(/\.md-alert:hover \{/g, ".md-alert:hover, .markdown-alert:hover {");
    css = css.replace(/\.md-alert:hover::after \{/g, ".md-alert:hover::after, .markdown-alert::after:hover {");

    // Colors per admonition type
    const types = ['note', 'tip', 'warning', 'important', 'caution'];
    for (let type of types) {
        css = css.replace(new RegExp(`\\.md-alert\\.md-alert-${type} \\{`, 'g'), `.md-alert.md-alert-${type}, .markdown-alert.markdown-alert-${type} {`);
        css = css.replace(new RegExp(`\\.md-alert\\.md-alert-${type}:hover \\{`, 'g'), `.md-alert.md-alert-${type}:hover, .markdown-alert.markdown-alert-${type}:hover {`);
        css = css.replace(new RegExp(`\\.md-alert\\.md-alert-${type} \\.md-alert-text-container \\{`, 'g'), `.md-alert.md-alert-${type} .md-alert-text-container, .markdown-alert.markdown-alert-${type} .markdown-alert-title {`);
        css = css.replace(new RegExp(`\\.md-alert\\.md-alert-${type}::after \\{`, 'g'), `.md-alert.md-alert-${type}::after, .markdown-alert.markdown-alert-${type}::after {`);
    }

    fs.writeFileSync(file, css, 'utf8');
}

mapAlerts('src/css/phycat-abyss.css');
mapAlerts('src/css/phycat-sky.css');

// Now clean up custom.css
let customCss = fs.readFileSync('src/css/custom.css', 'utf8');

// Remove our old .theme-admonition overrides:
customCss = customCss.replace(/\/\* ---------------------------------------------------------\s*MAPPING ADMONITION \(CHỈ SỬ DỤNG CSS CỦA THEME GỐC\)\s*--------------------------------------------------------- \*\/[\s\S]*?margin-bottom: 1rem;\n}\n/g, '');

const extraFix = `
/* Hide duplicate Docusaurus native admonition headings if any residual */
html .markdown .theme-admonition [class^="admonitionHeading_"] { display: none !important; }

/* Ensure markdown-alert has basic block margins so it is not cramped */
html .markdown-alert { margin: 1.5rem 0; }
html .markdown-alert > p.markdown-alert-title { display: inline-flex; align-items: center; margin-bottom: 8px; }
html .markdown-alert > p.markdown-alert-title svg { margin-right: 5px; width: 1em; height: 1em; fill: currentColor; }
html .markdown-alert > *:last-child { margin-bottom: 0; }
`;

customCss += extraFix;

fs.writeFileSync('src/css/custom.css', customCss, 'utf8');
console.log('Fixed markdown alerts mappings!');
