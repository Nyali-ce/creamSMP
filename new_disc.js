const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

function ensureDirSync(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath, fallback) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.warn(`Warning: could not parse ${filePath}, using fallback.`, e);
        }
    }
    return fallback;
}

function writeJson(filePath, data) {
    ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Wrote ${filePath}`);
}

async function main() {
    const oggPath = (await ask('Path to the .ogg file: ')).trim().replace(/^"|"$/g, '');
    const name = (await ask('Name for the disc (e.g. "my_song"): ')).trim();

    if (!name) {
        console.error('Name cannot be empty.');
        rl.close();
        return;
    }

    if (!fs.existsSync(oggPath) || path.extname(oggPath).toLowerCase() !== '.ogg') {
        console.error('The provided file does not exist or is not a .ogg file.');
        rl.close();
        return;
    }

    const namespace = 'creamsmp';
    const discId = `${name}_disc`;

    const rpRoot = path.join(__dirname, 'resourcepack', 'assets', namespace);
    const dpRoot = path.join(__dirname, 'datapack', 'data', namespace);

    // 1. Copy the .ogg file into resourcepack sounds folder
    const soundsDir = path.join(rpRoot, 'sounds', 'music_disc');
    ensureDirSync(soundsDir);
    const soundDest = path.join(soundsDir, `${discId}.ogg`);
    fs.copyFileSync(oggPath, soundDest);
    console.log(`Copied sound to ${soundDest}`);

    // 2. items/<name>_disc.json
    const itemsDir = path.join(rpRoot, 'items');
    const itemJson = {
        model: {
            type: "minecraft:model",
            model: `${namespace}:item/${discId}`
        }
    };
    writeJson(path.join(itemsDir, `${discId}.json`), itemJson);

    // 3. models/item/<name>_disc.json
    const modelsDir = path.join(rpRoot, 'models', 'item');
    const modelJson = {
        parent: "minecraft:item/generated",
        textures: {
            layer0: `${namespace}:item/${discId}`
        }
    };
    writeJson(path.join(modelsDir, `${discId}.json`), modelJson);

    // 4. sounds.json
    const soundsJsonPath = path.join(rpRoot, 'sounds.json');
    const soundsJson = readJsonSafe(soundsJsonPath, {});
    const soundEventKey = `music_disc.${discId}`;
    soundsJson[soundEventKey] = {
        sounds: [{ "name": `${namespace}:music_disc/${discId}`, "volume": 1, "stream": true }]
    };
    writeJson(soundsJsonPath, soundsJson);

    // 5. Jukebox song datapack entry
    const jukeboxSongDir = path.join(dpRoot, 'jukebox_song');
    const jukeboxSongJson = {
        sound_event: {
            sound_id: `${namespace}:${soundEventKey}`
        },
        description: {
            text: `Author - ${name}`
        },
        length_in_seconds: 60,
        comparator_output: 15
    };
    writeJson(path.join(jukeboxSongDir, `${discId}.json`), jukeboxSongJson);

    // 6. Recipe in the datapack folder
    const recipeDir = path.join(dpRoot, 'recipe');
    const recipeJson = {
        type: "minecraft:crafting_shaped",
        category: "misc",
        pattern: [
            " P ",
            "PDP",
            " P "
        ],
        key: {
            P:
                "minecraft:iron"
            ,
            D:
                "minecraft:gold_ingot"

        },
        result: {
            id: `minecraft:music_disc_cat`,
            components: {
                "minecraft:jukebox_playable": `${namespace}:${discId}`,
                "minecraft:item_model": `${namespace}:${discId}`
            }
        }
    };
    writeJson(path.join(recipeDir, `${discId}.json`), recipeJson);

    console.log('\nDone! Created/updated:');
    console.log(` - ${soundDest}`);
    console.log(` - ${path.join(itemsDir, discId + '.json')}`);
    console.log(` - ${path.join(modelsDir, discId + '.json')}`);
    console.log(` - ${soundsJsonPath}`);
    console.log(` - ${path.join(jukeboxSongDir, discId + '.json')}`);
    console.log(` - ${path.join(recipeDir, discId + '.json')}`);

    rl.close();
}

main().catch((err) => {
    console.error(err);
    rl.close();
});
