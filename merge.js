const fs = require('fs');
const nptPath = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/npt/src/css/custom.css';
const wikiPath = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css/custom.css';

const tailwindHeader = `@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

`;

const nptCss = fs.readFileSync(nptPath, 'utf8');
fs.writeFileSync(wikiPath, tailwindHeader + nptCss, 'utf8');
console.log('Successfully merged!');
