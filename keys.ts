import * as fs from 'fs';

const settings = JSON.parse(fs.readFileSync('local.settings.json', 'utf8'))
const values = settings.Values;
export default {
    openai: values.OPENAI_KEY,
    notion: values.NOTION_SECRET,
    spotify: {
        clientId: values.SPOTIFY_CLIENTID,
        clientSecret: values.SPOTIFY_CLIENTSECRET
    }
};