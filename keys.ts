import * as fs from 'fs';
import dotenv from 'dotenv';

try {
    dotenv.config();
} catch (err) {
    console.info('Could not load dotenv file. Falling back to env variables.');
}

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
            SPOTIFY_CLIENTSECRET: process.env.SPOTIFY_CLIENTSECRET,
            TWITTER_API_KEY: process.env.TWITTER_API_KEY,
            TWITTER_API_KEY_SECRET: process.env.TWITTER_API_KEY_SECRET,
            TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
            TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET
        }
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
    },
    twitter: {
        consumer: {
            apiKey: values.TWITTER_API_KEY,
            apiKeySecret: values.TWITTER_API_KEY_SECRET
        },
        bearerToken: values.TWITTER_BEARER_TOKEN,
        accessToken: values.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: values.TWITTER_ACCESS_TOKEN_SECRET,
        oauthToken: values.TWITTER_OAUTH_TOKEN
    }
};