const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Tìm các blockquote dạng Github Alerts: > [!TYPE]
    const regex = />\s*\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>\s*.*\n?)*)/g;
    
    const newContent = content.replace(regex, (match, type, body) => {
        let docusaurusType = type.toLowerCase();
        // Ánh xạ sang các loại admonitions của Docusaurus
        if (docusaurusType === 'important') docusaurusType = 'info';
        if (docusaurusType === 'caution') docusaurusType = 'danger';
        
        // Xóa dấu ">" ở đầu mỗi dòng trong phần nội dung
        const cleanBody = body.replace(/^>\s?/gm, '');
        
        return `:::${docusaurusType}\n\n${cleanBody}\n:::\n`;
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${path.basename(filePath)}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.md') || fullPath.endsWith('.mdx')) {
            processFile(fullPath);
        }
    }
}

walkDir(docsDir);
console.log("Đã chuyển đổi toàn bộ Github Alerts sang Docusaurus Admonitions.");
