const fs = require('fs');
const execSync = require('child_process').execSync;

try {
    execSync('git checkout -- src/css/custom.css');
    console.log("Restored custom.css from git.");
} catch (e) {
    console.log("Git checkout failed, maybe not changed or not tracked exactly. Error:", e.message);
}

let css = fs.readFileSync('src/css/custom.css', 'utf8');

// Wrap general typo styles missing dark theme selector
css = css.replace(/\.markdown \{\n    max-width: var\(--max-width\)/, "html[data-theme='dark'] .markdown {\n    max-width: var(--max-width)");
css = css.replace(/\.markdown h1 {/g, "html[data-theme='dark'] .markdown h1 {");
css = css.replace(/\.markdown h1::after {/g, "html[data-theme='dark'] .markdown h1::after {");
css = css.replace(/\.markdown h2::after {/g, "html[data-theme='dark'] .markdown h2::after {");
css = css.replace(/\.markdown h3::after { content:/g, "html[data-theme='dark'] .markdown h3::after { content:");
css = css.replace(/\.markdown h4::after { content:/g, "html[data-theme='dark'] .markdown h4::after { content:");
css = css.replace(/\.markdown h5::after { content:/g, "html[data-theme='dark'] .markdown h5::after { content:");
css = css.replace(/\.markdown h6::after { content:/g, "html[data-theme='dark'] .markdown h6::after { content:");
css = css.replace(/\.markdown p, \.markdown li {/g, "html[data-theme='dark'] .markdown p, html[data-theme='dark'] .markdown li {");

// Remove light mode targeted rules that override proper variables
css = css.replace(
`html[data-theme='dark'] .markdown h3:after,
html[data-theme='dark'] .markdown h4:after,
html[data-theme='dark'] .markdown h5:after,
html[data-theme='dark'] .markdown h6:after,
html[data-theme='light'] .markdown h3:after,
html[data-theme='light'] .markdown h4:after,
html[data-theme='light'] .markdown h5:after,
html[data-theme='light'] .markdown h6:after {`, 
`html[data-theme='dark'] .markdown h3:after,
html[data-theme='dark'] .markdown h4:after,
html[data-theme='dark'] .markdown h5:after,
html[data-theme='dark'] .markdown h6:after {`
);

css = css.replace(
`html[data-theme='dark'] .markdown h4:after,
html[data-theme='light'] .markdown h4:after {`, 
`html[data-theme='dark'] .markdown h4:after {`
);

css = css.replace(
`html[data-theme='dark'] .markdown h5:after,
html[data-theme='light'] .markdown h5:after {`, 
`html[data-theme='dark'] .markdown h5:after {`
);

css = css.replace(
`html[data-theme='dark'] .markdown h6:after,
html[data-theme='light'] .markdown h6:after {`, 
`html[data-theme='dark'] .markdown h6:after {`
);

fs.writeFileSync('src/css/custom.css', css, 'utf8');
console.log("Successfully fixed custom.css for standard light and dark mode rules!");
