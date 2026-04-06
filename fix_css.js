const fs = require('fs');
const path = require('path');

const cssDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';
const configPath = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docusaurus.config.js';

// 1. Remove @import from phycat files to prevent Webpack CSS bundle errors
let abyss = fs.readFileSync(path.join(cssDir, 'phycat-abyss.css'), 'utf8');
abyss = abyss.replace('@import url(./phycat/phycat.dark.css);', '');
fs.writeFileSync(path.join(cssDir, 'phycat-abyss.css'), abyss, 'utf8');

let sky = fs.readFileSync(path.join(cssDir, 'phycat-sky.css'), 'utf8');
sky = sky.replace('@import url(./phycat/phycat.light.css);', '');
fs.writeFileSync(path.join(cssDir, 'phycat-sky.css'), sky, 'utf8');

// 2. Fix custom.css @import order
let customCss = fs.readFileSync(path.join(cssDir, 'custom.css'), 'utf8');
customCss = customCss.replace("@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');\n", "");
customCss = customCss.replace("@import url('https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css');\n", "");

const newTop = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css');\n`;

customCss = newTop + customCss;
fs.writeFileSync(path.join(cssDir, 'custom.css'), customCss, 'utf8');

// 3. Update docusaurus.config.js to load the missing phycat core css explicitly 
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(
    /customCss: \[\s+'\.\/src\/css\/custom\.css',\s+'\.\/src\/css\/phycat-abyss\.css',\s+'\.\/src\/css\/phycat-sky\.css'\s+\]/,
    `customCss: [
            './src/css/custom.css',
            './src/css/phycat/phycat.dark.css',
            './src/css/phycat-abyss.css',
            './src/css/phycat/phycat.light.css',
            './src/css/phycat-sky.css'
          ]`
);
fs.writeFileSync(configPath, config, 'utf8');

console.log("Fixed CSS imports!");
