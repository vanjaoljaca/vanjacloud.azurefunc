import crypto from "crypto";
import OAuth from "oauth-1.0a";


const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


import keys from "../keys";
// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
// export CONSUMER_KEY='YOUR-KEY'
// export CONSUMER_SECRET='YOUR-SECRET'
const consumer_key = keys.twitter.consumer.apiKey;
const consumer_secret = keys.twitter.consumer.apiKeySecret;


// Be sure to add replace the text of the with the text you wish to Tweet.
// You can also add parameters to post polls, quote Tweets, Tweet with reply settings, and Tweet to Super Followers in addition to other features.
const data = {
    "text": "Hello world!"
};

const endpointURL = `https://api.twitter.com/2/tweets`;

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write';
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
const oauth = new OAuth({
    consumer: {
        key: consumer_key,
        secret: consumer_secret
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

async function input(prompt) {
    return new Promise(async (resolve, reject) => {
        readline.question(prompt, (out) => {
            readline.close();
            resolve(out);
        });
    });
}

import axios from 'axios';
import qs from 'qs';

async function requestToken() {
    try {
        let r = oauth.authorize({
            url: requestTokenURL,
            method: 'POST'
        }); //?
        const authHeader = oauth.toHeader(r); //?

        const response = await axios.post(requestTokenURL, {}, {
            headers: {
                Authorization: authHeader["Authorization"]
            }
        });
        if (response.data) {
            return qs.parse(response.data);
        } else {
            throw new Error('Cannot get an OAuth request token');
        }
    } catch (e) {
        console.log(JSON.stringify(e));//?
    }

}

async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
    const authHeader = oauth.toHeader(oauth.authorize({
        url: accessTokenURL,
        method: 'POST'
    }));
    const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
    const response = await axios.post(path, {}, {
        headers: {
            Authorization: authHeader["Authorization"]
        }
    });
    if (response.data) {
        return qs.parse(response.data);
    } else {
        throw new Error('Cannot get an OAuth request token');
    }
}

async function getRequest({ oauth_token, oauth_token_secret }) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    };

    const authHeader = oauth.toHeader(oauth.authorize({
        url: endpointURL,
        method: 'POST'
    }, token));

    const response = await axios.post(endpointURL, data, {
        headers: {
            Authorization: authHeader["Authorization"],
            'user-agent': "v2CreateTweetJS",
            'content-type': "application/json",
            'accept': "application/json"
        }
    });
    if (response.data) {
        return response.data;
    } else {
        throw new Error('Unsuccessful request');
    }
}




export default async function play() {
    try {
        // Get request token
        // const oAuthRequestToken = await requestToken();
        // // Get authorization
        // authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token as any);
        // console.log('Please go here and authorize: ' + authorizeURL.href);
        // const pin = await input('Paste the PIN here: ');
        // // Get the access token
        // const oAuthAccessToken = await accessToken(oAuthRequestToken as any, (pin as any).trim());
        const oAuthAccessToken = keys.twitter.oauthToken;
        console.log(oAuthAccessToken)
        // Make the request
        const response = await getRequest(oAuthAccessToken as any);
        console.dir(response, {
            depth: null
        });
    } catch (e) {
        console.log(e);
    }
}