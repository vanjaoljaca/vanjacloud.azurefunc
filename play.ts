// testable-http-triggered-function/__tests__/index.test.ts


import HackerNews from './main/hackernews'
import fetch from 'node-fetch';

import dotenv from 'dotenv';
import axios from 'axios';
import { ChatGPT } from "vanjacloud.shared.js";
process.env['DEBUG'] = 'true'
import OpenAI from 'openai';

dotenv.config();


async function debug() {

    try {
        const client = new OpenAI({
            apiKey: process.env['OPENAI_API_KEY']
            // baseURL: 'https://api.openai.com/v1/'
        })
        console.log(client.baseURL)
        // Non-streaming:
        const result = await client.completions.create({
            prompt: 'Say this is a test',
            model: 'text-davinci-003',
        },
        //     {
        //     query : { "api-version": "2023-06-01-preview" },
        //     headers: {'api-key': Keys.openai}
        // }
        );
        console.log(result.choices[0]!.text);
    }
    catch (e) {
        console.log(e.stack)
    }
}

// debug()



// Initialize the OpenAI API with your API key
const MODEL_NAME = 'gpt-3.5-turbo-16k';

async function summarize(stuff: string) {
    const systemPrompt =
        "User will provide a HackerNews article, with comments. Infer what the original page was discussing, then pull a few of the most interesting comments / insights. Summarise the user's input in an entertaining way. no more than 3 paragraphs.Do not act as a basic summary, think of the output as a new article or story that can be shared on social media. Do not reference hacker news or specific users or the original article when writing the new content. Don't reference any commenters if discussing things about the thing, only reference commenters if the commenter references themself. Else just say \"some people\". Make sure not to end on a negative note.  Since you're not referencing the HN article, you can't reference 'notable comments', just talk about the subject at hand.";
    const chat = new ChatGPT.Client({
        apiKey: process.env['OPENAI_API_KEY'],
        systemPrompt
    })
    const response = await chat.say(stuff);
    return response;
}

async function getChatGptChat() {
    // https://chat.openai.com/share/0f34e961-bea3-4d1b-8b4f-c9b9e37ffe6c
}

async function playgpt() {
    // await mostActive();
    const stories = await HackerNews.getFrontpage();
    const story = await HackerNews.getStory(stories[25].id)
    const storyUrlResponse = await fetch(story.url)
    const storyText = await storyUrlResponse.text()
    const comments = await HackerNews.getComments(story.id)
    console.log(stories);
    console.log(story);
    const summary = await summarize(
        JSON.stringify({
            story,
            comments
        }))
    console.log(JSON.stringify(summary))
}

// play();

// quit script
// process.exit(0);
// console.log('not played')

const generateAccessToken = async () => {
    const appId = 'todo';
    const appSecret = 'todo';
    const url = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=client_credentials&client_id=${appId}&client_secret=${appSecret}`;

    try {
        const response = await axios.get(url);
        const accessToken = response.data.access_token;
        console.log(accessToken);
    } catch (error) {
        console.error(error);
    }
};

// generateAccessToken();

// Usage
// sendMessage('12067397964', 'Hello, world!');

import play from './main/twitter'
// play();
// playgpt();