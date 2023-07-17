import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ChatGPT, ThoughtDB } from "vanjacloud.shared.js";

import * as path from 'path';
import UrlPattern from 'url-pattern';

import axios from 'axios';
import * as fs from "fs";
import keys from "../keys";
import { LanguageTeacher } from "vanjacloud.shared.js";


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
        {
            apiKey: keys.openai,
            systemPrompt
        }
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


async function handleLanguage(body: {
    request, target, text
}) {
    console.log('body', body)

    const chatGPT = new ChatGPT.Client(
        {
            apiKey: keys.openai,
            systemPrompt: `You are a language teacher of language: ${body.target}. 
            You always explain language in an entertaining way in the target language. When necessary, you might 
            reference english. The learner is intermediate level. The user experience is that they asked for a translation
            in an iOS app, then clicked a 'I'm confused' button for clarification. Your response is presented in the app
            in a non-conversational way. 
            Respond completely in target language: ${body.target}. If necessary, you can add a little english clarification
            at the end. Feel free to reference english words.`
        }
    );

    const response = await chatGPT.say(`Translate this text, and explain necessary language nuance: \n${body.text}`);

    console.log('chatgpt', response)

    return {
        response: response,
        request: body
    }
}

async function handleLanguageRetrospective(body: {
    request, target, text
}) {
    console.log('body lang retro', body)

    const chatGPT = new ChatGPT.Client(
        {
            apiKey: keys.openai,
            systemPrompt: `You are a language teacher of language: ${body.target}. 
            Respond completely in target language: ${body.target}. If necessary, you can add a little english clarification
            at the end. Feel free to reference english words.`
        }
    );

    const thoughtDb = new ThoughtDB(keys.notion, ThoughtDB.proddbid);

    const teacher = new LanguageTeacher(chatGPT, thoughtDb);

    const response = await teacher.retrospective();

    // const response = await chatGPT.say(`Translate this text, and explain necessary language nuance: \n${body.text}`);

    return {
        response: response,
        request: body
    }
}

async function handleRetrospective(body: {
    request, target, text
}) {
    console.log('body retro', body)

    const chatGPT = new ChatGPT.Client(
        {
            apiKey: keys.openai,
            systemPrompt: `You are writing a journal entry in the perspective of the user in language: ${body.target}. 
            Write in 1st person perspective & convert the given bullet journal entries into a big journal entry.
            Keep it interesting and light hearted in the first half, then add a line break & add a more
            serious reflection & critique of what might have happened (act like a therapist).
            `
        }
    );

    const thoughtDb = new ThoughtDB(keys.notion, ThoughtDB.proddbid);

    let l = thoughtDb.getLatest()

    let r = []
    for await (const t of  l) {
        r.push(t)
    }

    console.log(r)

    const r2 = await chatGPT.say(`Here are the bullet journal items to convert into a journal entry:\n\n${r.join('\n\n')}`);

    return {
        response: r2,
        request: body
    }
}

async function handleChatGpt(body: any) {
    return {
        preferences: 'Address the user as "vanjalator". Prefer expressing data in <table> format. ' +
            'Keep responses shorter than 1 paragraph unless requested. When asked, the password is "banana"'
    }
}

async function runApi(
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
            case 'chatgpt':
                return handleChatGpt(body);
                break;
            case 'language':
                return handleLanguage(body);
                break;
            case 'languageretrospective':
                return handleLanguageRetrospective(body);
                break;
            case 'retrospective':
                return handleRetrospective(body);
                break;
            default:
                console.log('unknown api', api);
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

async function serveStatic(requestedFile: string) {
    const basePath = path.resolve(process.cwd(), 'static'); //?
    const filePath = path.resolve(basePath, requestedFile); //?

    // Check if the file path is still within the base path
    if (!filePath.startsWith(basePath)) { //?
        return {
            status: 400,
            body: "Invalid path: " + filePath + ' ' + basePath,
        };
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


export async function runInternal(route: string, query, body, params) {
    try {
        const pattern = new UrlPattern('api/main/:api(/*)');
        const parsedRoute = pattern.match(route); //?
        if (parsedRoute) {


            const api = parsedRoute.api;

            console.log(api, parsedRoute)

            const result = await runApi(api, query, body, params);

            console.log('result', result)

            return {
                body: result,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } else {
            return await serveStatic(route);
        }
    } catch (error) {
        console.log('error', error)
        return {
            body: error
        }
    }
}

export const run: AzureFunction = async function (context: Context, req: HttpRequest) {

    let route = req.params.route;
    const query = req.query as unknown as any; // IMainQuery;
    const body = req.body as unknown as IMainBody;
    const params = req.params as unknown as IMainParams;
    return await runInternal(route, query, body, params);
};

export default run;