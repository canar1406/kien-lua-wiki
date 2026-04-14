const fs = require('fs');
const path = require('path');

const newGltf = path.join(__dirname, 'static/models/fire_ant/ant.gltf');
const newBin = path.join(__dirname, 'static/models/fire_ant/ant.bin');
const oldGltf = path.join(__dirname, 'static/models/fire_ant/Fire Ant  ( Worker ).gltf');
const oldBin = path.join(__dirname, 'static/models/fire_ant/Fire Ant  ( Worker ).bin');

try {
    let data = fs.readFileSync(newGltf, 'utf8');
    data = data.replace(/"ant\.bin"/g, '"Fire Ant  ( Worker ).bin"');
    fs.writeFileSync(oldGltf, data);
    fs.renameSync(newBin, oldBin);
    fs.unlinkSync(newGltf);
    console.log('Reverted successfully');
} catch (e) {
    console.log(e.message);
}
