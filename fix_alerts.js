const fs = require('fs');

function prefixAlerts(file, prefix) {
    let css = fs.readFileSync(file, 'utf8');
    
    // Reverse previous naive prefixing hack (removes "html[data-theme='...'] " if it immediately prefixes .md-alert)
    const regexRemovePrefix = new RegExp(prefix.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + ' \\.md-alert', 'g');
    css = css.replace(regexRemovePrefix, '.md-alert');

    const regexRemovePrefix2 = new RegExp(prefix.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + ' \\.markdown-alert', 'g');
    css = css.replace(regexRemovePrefix2, '.markdown-alert');

    let out = [];
    let blocks = css.split('}');
    for (let block of blocks) {
        if (!block.trim()) { out.push(block); continue; }
        let parts = block.split('{');
        if (parts.length === 2 && (parts[0].includes('.md-alert') || parts[0].includes('.markdown-alert'))) {
            let selectors = parts[0].split(',');
            let newSelectors = selectors.map(s => {
                if (s.includes('.md-alert') || s.includes('.markdown-alert')) {
                    if (!s.includes(prefix)) {
                        return prefix + ' ' + s.trim();
                    }
                }
                return s;
            });
            out.push(newSelectors.join(', ') + ' {' + parts[1]);
        } else {
            out.push(block);
        }
    }
    fs.writeFileSync(file, out.join('}'));
}

prefixAlerts('src/css/phycat-abyss.css', "html[data-theme='dark']");
prefixAlerts('src/css/phycat-sky.css', "html[data-theme='light']");
console.log('Fixed syntax perfectly!');
