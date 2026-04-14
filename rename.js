const fs = require('fs');
const path = require('path');

const oldGltf = path.join(__dirname, 'static/models/fire_ant/Fire Ant  ( Worker ).gltf');
const oldBin = path.join(__dirname, 'static/models/fire_ant/Fire Ant  ( Worker ).bin');
const newGltf = path.join(__dirname, 'static/models/fire_ant/ant.gltf');
const newBin = path.join(__dirname, 'static/models/fire_ant/ant.bin');

try {
    let data = fs.readFileSync(oldGltf, 'utf8');
    data = data.replace(/"Fire Ant  \( Worker \)\.bin"/g, '"ant.bin"');
    fs.writeFileSync(newGltf, data);
    fs.renameSync(oldBin, newBin);
    fs.unlinkSync(oldGltf);
    console.log('Renamed files successfully');
} catch (e) {
    if (fs.existsSync(newGltf)) {
        console.log('Already renamed.');
    } else {
        console.error(e);
    }
}
