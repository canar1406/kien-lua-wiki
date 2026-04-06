const fs = require('fs');
const path = require('path');

const cssDir = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/src/css';
const configPath = 'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docusaurus.config.js';

// 1. Phục hồi lại file custom.css, xoá ký tự tàng hình BOM gây lỗi Webpack
let customCss = fs.readFileSync(path.join(cssDir, 'custom.css'), 'utf8');
customCss = customCss.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Xóa BOM
fs.writeFileSync(path.join(cssDir, 'custom.css'), customCss, 'utf8');

// 2. Phục hồi cấu trúc Docusaurus Config
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(
    /customCss: \[(\s|.)*?\],/g,
    `customCss: [
            './src/css/custom.css',
            './src/css/phycat-abyss.css',
            './src/css/phycat-sky.css'
          ],`
);
fs.writeFileSync(configPath, config, 'utf8');

// 3. Xử lý gộp file cực chuẩn xác để Webpack không báo lỗi @import mà giao diện vẫn đẹp tuyệt đối
// Gộp abyss (Dark mode)
let abyssCore = fs.readFileSync(path.join(cssDir, 'phycat', 'phycat.dark.css'), 'utf8');
let abyssOuter = fs.readFileSync(path.join(cssDir, 'phycat-abyss.css'), 'utf8');
abyssOuter = abyssOuter.replace('@import url(./phycat/phycat.dark.css);', ''); // Đề phòng còn sót
fs.writeFileSync(path.join(cssDir, 'phycat-abyss.css'), abyssCore + '\n' + abyssOuter, 'utf8');

// Gộp sky (Light mode)
let skyCore = fs.readFileSync(path.join(cssDir, 'phycat', 'phycat.light.css'), 'utf8');
let skyOuter = fs.readFileSync(path.join(cssDir, 'phycat-sky.css'), 'utf8');
skyOuter = skyOuter.replace('@import url(./phycat/phycat.light.css);', '');
fs.writeFileSync(path.join(cssDir, 'phycat-sky.css'), skyCore + '\n' + skyOuter, 'utf8');

console.log("Hoàn thành quá trình phục hồi nhan sắc cho CSS và giải quyết dứt điểm lỗi BOM Webpack!");
