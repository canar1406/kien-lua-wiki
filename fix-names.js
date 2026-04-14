const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'static/models/fire_ant');

// Current filenames
const oldGltf = path.join(dir, 'Fire Ant  ( Worker ).gltf');
const oldBin = path.join(dir, 'Fire Ant  ( Worker ).bin');

// New clean filenames  
const newGltf = path.join(dir, 'fire-ant.gltf');
const newBin = path.join(dir, 'fire-ant.bin');

try {
    // Read and update the gltf to reference new bin name
    let data = fs.readFileSync(oldGltf, 'utf8');
    // The buffer URI inside gltf points to the bin file
    data = data.replace(/Fire Ant\s+\( Worker \)\.bin/g, 'fire-ant.bin');
    
    // Write new gltf
    fs.writeFileSync(newGltf, data);
    console.log('Created fire-ant.gltf');
    
    // Copy bin (not rename, keep original as backup)
    fs.copyFileSync(oldBin, newBin);
    console.log('Copied fire-ant.bin');
    
    // Verify
    const verifyData = JSON.parse(fs.readFileSync(newGltf, 'utf8'));
    console.log('Buffer URI in new gltf:', verifyData.buffers[0].uri);
    console.log('New bin size:', fs.statSync(newBin).size);
    console.log('SUCCESS!');
} catch(e) {
    console.error('Error:', e.message);
}
