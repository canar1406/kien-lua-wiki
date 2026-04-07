const fs = require('fs');

const abyss = "c:\\Users\\Heavietnam\\Desktop\\Dự án kiến lửa\\wiki\\src\\css\\phycat-abyss.css";
fs.appendFileSync(abyss, `\n/* Custom Roboto Typography Enhancements */
html[data-theme='dark'] .markdown h1 { font-weight: 900 !important; }
html[data-theme='dark'] .markdown h2 { font-weight: 700 !important; }
html[data-theme='dark'] .markdown h3 { font-weight: 700 !important; }
html[data-theme='dark'] .markdown h4, html[data-theme='dark'] .markdown h5, html[data-theme='dark'] .markdown h6 { font-weight: 500 !important; }
html[data-theme='dark'] .markdown blockquote, html[data-theme='dark'] .markdown blockquote p { font-style: italic; font-weight: 300; }
html[data-theme='dark'] .markdown strong { font-weight: 700 !important; }\n`);

const sky = "c:\\Users\\Heavietnam\\Desktop\\Dự án kiến lửa\\wiki\\src\\css\\phycat-sky.css";
fs.appendFileSync(sky, `\n/* Custom Roboto Typography Enhancements */
html[data-theme='light'] .markdown h1 { font-weight: 900 !important; }
html[data-theme='light'] .markdown h2 { font-weight: 700 !important; }
html[data-theme='light'] .markdown h3 { font-weight: 700 !important; }
html[data-theme='light'] .markdown h4, html[data-theme='light'] .markdown h5, html[data-theme='light'] .markdown h6 { font-weight: 500 !important; }
html[data-theme='light'] .markdown blockquote, html[data-theme='light'] .markdown blockquote p { font-style: italic; font-weight: 300; }
html[data-theme='light'] .markdown strong { font-weight: 700 !important; }\n`);
