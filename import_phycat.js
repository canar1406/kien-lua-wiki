const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/npt';
const destDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';

// Copy root CSS files
const filesToCopy = ['phycat-abyss.css', 'phycat-forest.css', 'phycat-sky.css'];
filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file}`);
    }
});

// Copy phycat folder
const srcFolder = path.join(srcDir, 'phycat');
const destFolder = path.join(destDir, 'phycat');

function copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

if (fs.existsSync(srcFolder)) {
    copyRecursiveSync(srcFolder, destFolder);
    console.log('Copied phycat folder');
}

console.log('Theme files migration completed!');
