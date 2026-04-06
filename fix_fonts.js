const fs = require('fs');
const path = require('path');

const cssDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';

function fixFonts(filename) {
    let css = fs.readFileSync(path.join(cssDir, filename), 'utf8');
    css = css.replace(/url\(Cascadia-Code-Regular\.ttf\)/g, 'url(./phycat/Cascadia-Code-Regular.ttf)');
    css = css.replace(/url\(LXGWWenKai-Regular\.ttf\)/g, 'url(./phycat/LXGWWenKai-Regular.ttf)');
    fs.writeFileSync(path.join(cssDir, filename), css, 'utf8');
}

fixFonts('phycat-abyss.css');
fixFonts('phycat-sky.css');

console.log('Fixed font paths successfully!');
