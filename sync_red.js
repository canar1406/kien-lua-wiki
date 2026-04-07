const fs = require('fs');

try {
  const skyPath = 'src/css/phycat-sky.css';
  let skyContent = fs.readFileSync(skyPath, 'utf8');

  // Replace blue variables with red
  skyContent = skyContent.replace(/--head-title-color: #3498db;/g, '--head-title-color: #dc2626;');
  skyContent = skyContent.replace(/--head-title-h2-background: linear-gradient\(to right, #85c1e9, #3498db, #85c1e9\);/g, '--head-title-h2-background: linear-gradient(to right, #fca5a5, #dc2626, #fca5a5);');
  skyContent = skyContent.replace(/--element-color: #3498db;/g, '--element-color: #dc2626;');
  skyContent = skyContent.replace(/--element-color-deep: #2980b9;/g, '--element-color-deep: #b91c1c;');
  skyContent = skyContent.replace(/--element-color-shallow: #aed6f1;/g, '--element-color-shallow: #fca5a5;');
  skyContent = skyContent.replace(/--element-color-so-shallow: #eaf2f8;/g, '--element-color-so-shallow: #fee2e2;');
  skyContent = skyContent.replace(/--element-color-soo-shallow: #f4faff;/g, '--element-color-soo-shallow: #fef2f2;');
  skyContent = skyContent.replace(/--glass-bg-color:#cee6fa2b;/g, '--glass-bg-color:#fef2f22b;');
  skyContent = skyContent.replace(/--element-color-linecode: #1a5276;/g, '--element-color-linecode: #7f1d1d;');
  skyContent = skyContent.replace(/--element-color-linecode-background: #ebf5fb;/g, '--element-color-linecode-background: #fef2f2;');
  skyContent = skyContent.replace(/--appui-color: #3498db;/g, '--appui-color: #dc2626;');
  skyContent = skyContent.replace(/--appui-color-icon: #3498db;/g, '--appui-color-icon: #dc2626;');
  skyContent = skyContent.replace(/--primary-color: #3498db;/g, '--primary-color: #dc2626;');

  fs.writeFileSync(skyPath, skyContent, 'utf8');

  const abyssPath = 'src/css/phycat-abyss.css';
  let abyssContent = fs.readFileSync(abyssPath, 'utf8');

  abyssContent = abyssContent.replace(/--primary-color: #00f3ff;/g, '--primary-color: #ef4444;');
  abyssContent = abyssContent.replace(/--secondary-color: #2979ff;/g, '--secondary-color: #dc2626;');
  abyssContent = abyssContent.replace(/--accent-color: #d500f9;/g, '--accent-color: #f87171;');
  abyssContent = abyssContent.replace(/--glow-color: rgba\(0, 243, 255, 0\.5\);/g, '--glow-color: rgba(239, 68, 68, 0.5);');
  abyssContent = abyssContent.replace(/--hover-background-color: #00f3ff;/g, '--hover-background-color: #ef4444;');
  abyssContent = abyssContent.replace(/--select-text-bg-color: rgba\(0, 243, 255, 0\.3\);/g, '--select-text-bg-color: rgba(239, 68, 68, 0.3);');
  abyssContent = abyssContent.replace(/--h2-bg-image: radial-gradient\(ellipse at center bottom, rgba\(0, 243, 255, 0\.15\), transparent 70\%\);/g, '--h2-bg-image: radial-gradient(ellipse at center bottom, rgba(239, 68, 68, 0.15), transparent 70%);');
  abyssContent = abyssContent.replace(/--glass-border-color: rgba\(0, 243, 255, 0\.1\);/g, '--glass-border-color: rgba(239, 68, 68, 0.1);');

  fs.writeFileSync(abyssPath, abyssContent, 'utf8');
  console.log('Colors synced completely.');
} catch (e) {
  console.error(e);
}
