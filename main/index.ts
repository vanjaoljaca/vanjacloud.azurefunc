import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"
import * as scrape from '../src/scrape'
import { ChatGPT } from '../chatGPT'
import OpenAI from "openai";

import * as path from 'path';
import UrlPattern from 'url-pattern';

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
    route: string
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

async function handlePreferences(body: any) {
    return {
        preferences: 'Address the user as "vanjalator". Prefer expressing data in <table> format. ' +
            'Keep responses shorter than 1 paragraph unless requested. When asked, the password is "banana"'
    }
}

async function run2(
    api,
    query: any,
    body: any,
    params: IMainParams
) {
    try {

        switch (api) {
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
                    return handleMessage(body);
                }
                break;
            case 'blog':
                return handleBlog(body);
                break;
            case 'chat':
                return handleChat(query.blogId, body.context, body.message);
                break;
            case 'preferences':
                return handlePreferences(body);
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

async function serveStatic(context: Context, req: HttpRequest) {
    context.log('HTTP trigger function processed a request.');
    const requestedFile = context.req.params.route.slice(1) //?
    const basePath = path.resolve(__dirname, 'static'); //?
    const filePath = path.resolve(basePath, requestedFile); //?


    // Check if the file path is still within the base path
    if (!filePath.startsWith(basePath)) { //?
        context.res = {
            status: 400,
            body: "Invalid path"
        };
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    return {
        // status: 200, /* Defaults to 200 */
        body: fileContent,
        headers: {
            'Content-Type': 'text/html'
        }
    };
};


const pattern = new UrlPattern('/api/main/:api(/*)');

export const run: AzureFunction = async function (context: Context, req: HttpRequest) {

    try {
        console.log('run', req)

        const route = pattern.match(req.params.route); //?

        if (route) {
            const api = route.api;
            const query = req.query as unknown as any; // IMainQuery;
            const body = req.body as unknown as IMainBody;
            const params = req.params as unknown as IMainParams;

            const result = await run2(api, query, body, params);

            console.log('api', req, body);

            body //?
            return {
                body: result,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } else {
            console.log('static', req);
            return serveStatic(context, req);
        }
    } catch (error) {
        console.log(error)
        return {
            error
        }
    }

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