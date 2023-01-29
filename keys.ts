import * as fs from 'fs';

let values;
try {
    const settingsJson = fs.readFileSync('local.settings.json', 'utf8');
    const settings = JSON.parse(settingsJson);
    values = settings.Values;
} catch (err) {
    console.log('Error loading settings: ', err)
    values = {}
}

export default {
    openai: values.OPENAI_KEY,
    notion: values.NOTION_SECRET,
    spotify: {
        clientId: values.SPOTIFY_CLIENTID,
        clientSecret: values.SPOTIFY_CLIENTSECRET
    }
};