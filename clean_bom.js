const fs = require('fs');
const path = require('path');

const cssDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';

function cleanBom(filename) {
    const filePath = path.join(cssDir, filename);
    let css = fs.readFileSync(filePath, 'utf8');
    // Normalize and remove BOMs anywhere in the file
    css = css.replace(/[\u200B-\u200D\uFEFF]/g, '');
    fs.writeFileSync(filePath, css, 'utf8');
}

cleanBom('phycat-abyss.css');
cleanBom('phycat-sky.css');
cleanBom('custom.css');

console.log('Removed hidden BOM characters from CSS files!');
