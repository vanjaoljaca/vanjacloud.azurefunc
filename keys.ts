import * as fs from 'fs';

let values;
try {
    const settingsJson = fs.readFileSync('local.settings2.json', 'utf8');
    const settings = JSON.parse(settingsJson);
    values = settings.Values;
} catch (err) {
    console.warn('Error loading settings file. Falling back to env variables.');
    values = {
        OPENAI_KEY: process.env.OPENAI_KEY,
        NOTION_SECRET: process.env.NOTION_SECRET,
        SPOTIFY_CLIENTID: process.env.SPOTIFY_CLIENTID,
        SPOTIFY_CLIENTSECRET: process.env.SPOTIFY_CLIENTSECRET
    }
    console.info('Loaded env variables:',
        Object.keys(values).map(k => `${k}: ${values[k]?.length}`));
}

export default {
    openai: values.OPENAI_KEY,
    notion: values.NOTION_SECRET,
    spotify: {
        clientId: values.SPOTIFY_CLIENTID,
        clientSecret: values.SPOTIFY_CLIENTSECRET
    }
};