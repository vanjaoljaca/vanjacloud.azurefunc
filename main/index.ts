import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"
import * as scrape from '../src/scrape'
import { ChatGPT } from '../chatGPT'
import OpenAI from "openai";

import axios from 'axios';
import * as fs from "fs";
import keys from "../keys";


const systemPromptTemplate = fs.readFileSync('./content/systemprompt.template.md', 'utf8');
const blogSummary = fs.readFileSync('./content/blog1.summary.md', 'utf8');
const blogRaw = fs.readFileSync('./content/blog1.raw.md', 'utf8');

const systemPrompt =
    `${systemPromptTemplate}
    
    Introduction:
    ${blogSummary}
    
    Full Post:
    ${blogRaw}
    `

const openai = new OpenAI({
    apiKey: keys.openai
});

export interface IMainQuery {
    id: number;
}

export interface IMainBody {
    body: true
}

export interface IMainParams {
    api: string
}

export const Message = ChatGPT.Message;

interface WhatsAppMessage {
    object: string;
    entry: [{
        id: string;
        time: number;
        changes: [{
            field: "messages" | any;
            value: {
                message: {
                    from: string;
                    id: string;
                    text: {
                        body: string;
                    };
                }
            }
        }]
    }]
}


const accessToken = process.env['FB_SECRET']

export async function sendMessage(to: string, message: string) {
    const url = `https://graph.facebook.com/v17.0/112171265246690/messages`;

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
            name: 'hello_world',
            language: {
                code: 'en_US',
            },
        },
    };

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
};


function handleMessage(body: WhatsAppMessage) {
    if (body.object == 'whatsapp_business_account') {
        let entry = body.entry;
        for (const m of entry[0].changes.map(c => c.value.message)) {
            console.log("Got Message", m)
        }
        return 'good';
    }
    return {
        error: 'invalid token'
    }
}

async function handleBlog(body) {
    console.log('blog.body', body)
    return {
        id: body.blogId,
        text: blogSummary
    }
}

async function handleChat(blogId, context: ChatGPT.Message[], message: string) {
    context = context || [];

    console.log('handleChat', blogId, context, message)

    const chatGPT = new ChatGPT.Client(
        openai,
        systemPrompt
    );

    const response = await chatGPT.invoke([
        ...context,
        Message.user(message)
    ]);

    return {
        blogId,
        response
    }
}

async function run2(req: HttpRequest) {
    try {
        req //?
        const query = req.query as unknown as any; // IMainQuery; 
        const body = req.body as unknown as IMainBody;
        const params = req.params as unknown as IMainParams;


        switch (params.api) {
            case 'spotify':
                return {
                    spotify: true
                }
                break;
            case 'whatsapp':
            case 'messenger':
                if (query['hub.verify_token'] == 'vanjacloud') {
                    return query['hub.challenge'];
                } else {
                    return handleMessage(req.body);
                }
                break;
            case 'blog':
                return handleBlog(req.body);
                break;
            case 'chat':
                return handleChat(query.blogId, req.body.context, req.body.message);
                break;
            default:
                console.log('unknown api');
                return {
                    error: 'unknown api'
                }
        }
    } catch (error) {
        console.log(error)
        return {
            error
        }
    }
}

export const run: AzureFunction = async function (context: Context, req: HttpRequest) {
    const body = await run2(req);

    console.log('request', req, body);

    return {
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // console.log(context)
    // const client = df.getClient(context);
    // const id: string = req.params.id;
    // const entityId = new df.EntityId("Counter1", id);

    // if (req.method === "POST") {
    //     // increment value
    //     await client.signalEntity(entityId, "reset", 1);
    //     await client.signalEntity(entityId, "add", 1);
    //     await client.signalEntity(entityId, "add", 1);
    // } else {
    //     // reads current state of entity
    //     const stateResponse = await client.readEntityState<number>(entityId);
    //     return { body: stateResponse.entityState };
    // }
    // console.log('writ', entityId)
    // return query.id;
};

export default run;