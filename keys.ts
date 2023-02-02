import * as fs from 'fs';

let values: any;
try {
    let settingsJson;
    try {
        settingsJson = fs.readFileSync('local.settings.json', 'utf8');
    } catch (err) {
        console.info('Could not load local.settings.json file. Falling back to ../local.settings.json variables.');
        settingsJson = fs.readFileSync('../vanjacloudjs/local.settings.json', 'utf8');
    }
    const settings = JSON.parse(settingsJson);
    values = settings.Values;
} catch (err) {
    console.info('Could not load  settings file. Falling back to ../keys.json variables.');

    try {
        values = require('../keys.json');
    } catch (err) {
        console.info('Could not load ../keys.json file. Falling back to env variables.');

        console.log(values)

        values = {
            OPENAI_KEY: process.env.OPENAI_KEY,
            NOTION_SECRET: process.env.NOTION_SECRET,
            SPOTIFY_CLIENTID: process.env.SPOTIFY_CLIENTID,
            SPOTIFY_CLIENTSECRET: process.env.SPOTIFY_CLIENTSECRET
        }
        console.info('Loaded env variables:',
            Object.keys(values).map(k => `${k}: ${values[k]?.length}`));
    }
}

export default {
    openai: values.OPENAI_KEY,
    notion: values.NOTION_SECRET,
    spotify: {
        clientId: values.SPOTIFY_CLIENTID,
        clientSecret: values.SPOTIFY_CLIENTSECRET
    }
};