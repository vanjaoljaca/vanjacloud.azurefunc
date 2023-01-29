import * as dotenv from 'dotenv';
import * as fs from 'fs';

const env = dotenv.parse(fs.readFileSync('.env', 'utf8'))

export default {
    openai: env.OPENAI_KEY,
    notion: env.NOTION_SECRET,
    spotify: {
        clientId: env.SPOTIFY_CLIENTID,
        clientSecret: env.SPOTIFY_CLIENTSECRET
    }
};