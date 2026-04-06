const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/npt';
const destDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';

// 1. Restore the phycat css files
['phycat-abyss.css', 'phycat-forest.css', 'phycat-sky.css'].forEach(file => {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
});

// 2. Change custom.css Docusaurus :root variables
const customCssPath = path.join(destDir, 'custom.css');
let customCss = fs.readFileSync(customCssPath, 'utf8');

customCss = customCss.replace(/--ifm-color-primary: #2e8555;/g, '--ifm-color-primary: #3b82f6;');
customCss = customCss.replace(/--ifm-color-primary-dark: #29784c;/g, '--ifm-color-primary-dark: #2563eb;');
customCss = customCss.replace(/--ifm-color-primary-darker: #277148;/g, '--ifm-color-primary-darker: #1d4ed8;');
customCss = customCss.replace(/--ifm-color-primary-darkest: #205d3b;/g, '--ifm-color-primary-darkest: #1e3a8a;');
customCss = customCss.replace(/--ifm-color-primary-light: #33925d;/g, '--ifm-color-primary-light: #60a5fa;');
customCss = customCss.replace(/--ifm-color-primary-lighter: #359962;/g, '--ifm-color-primary-lighter: #93c5fd;');
customCss = customCss.replace(/--ifm-color-primary-lightest: #3cad6e;/g, '--ifm-color-primary-lightest: #bfdbfe;');

customCss = customCss.replace(/--ifm-color-primary: #25c2a0;/g, '--ifm-color-primary: #60a5fa;');
customCss = customCss.replace(/--ifm-color-primary-dark: #21af90;/g, '--ifm-color-primary-dark: #3b82f6;');
customCss = customCss.replace(/--ifm-color-primary-darker: #1fa588;/g, '--ifm-color-primary-darker: #2563eb;');
customCss = customCss.replace(/--ifm-color-primary-darkest: #1a8870;/g, '--ifm-color-primary-darkest: #1d4ed8;');
customCss = customCss.replace(/--ifm-color-primary-light: #29d5b0;/g, '--ifm-color-primary-light: #93c5fd;');
customCss = customCss.replace(/--ifm-color-primary-lighter: #32d8b4;/g, '--ifm-color-primary-lighter: #bfdbfe;');
customCss = customCss.replace(/--ifm-color-primary-lightest: #4fddbf;/g, '--ifm-color-primary-lightest: #dbeafe;');

fs.writeFileSync(customCssPath, customCss, 'utf8');

// 3. Change index.js from Red to Blue
const indexJSPath = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/pages/index.js';
let indexJS = fs.readFileSync(indexJSPath, 'utf8');

indexJS = indexJS.replace(/from-red-600\/30 to-orange-500\/10/g, 'from-blue-600/30 to-cyan-500/10');
indexJS = indexJS.replace(/bg-red-100 dark:bg-red-900\/30 text-red-600 dark:text-red-400/g, 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400');
indexJS = indexJS.replace(/border-red-200 dark:border-red-800/g, 'border-blue-200 dark:border-blue-800');
indexJS = indexJS.replace(/from-red-500 to-orange-500/g, 'from-blue-500 to-cyan-500');
indexJS = indexJS.replace(/from-red-600 to-red-500/g, 'from-blue-600 to-blue-500');
indexJS = indexJS.replace(/hover:from-red-500 hover:to-red-400/g, 'hover:from-blue-500 hover:to-blue-400');
indexJS = indexJS.replace(/rgb\(220,38,38,0\.3\)/g, 'rgb(59,130,246,0.3)');
indexJS = indexJS.replace(/text-red-500 dark:hover:text-red-400/g, 'text-blue-500 dark:hover:text-blue-400');
indexJS = indexJS.replace(/text-red-500/g, 'text-blue-500');

indexJS = indexJS.replace(/borderColor: '#ef4444'/g, "borderColor: '#3b82f6'");
indexJS = indexJS.replace(/backgroundColor: isDark \? 'rgba\(239, 68, 68, 0\.15\)' : 'rgba\(239, 68, 68, 0\.1\)'/g, "backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'");
indexJS = indexJS.replace(/pointBackgroundColor: '#ef4444'/g, "pointBackgroundColor: '#3b82f6'");

fs.writeFileSync(indexJSPath, indexJS, 'utf8');

console.log("Colors restored directly to soothing blue!");
