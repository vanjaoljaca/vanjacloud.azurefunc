import {AzureFunction, Context, HttpRequest} from "@azure/functions"
import * as df from "durable-functions"
import * as scrape from '../src/scrape'

/*
TODO:
- add tests
- connect to gpt
*/
export interface IMainQuery {
    id: number;
}

export interface IMainBody {
    test: string
}

export interface IMainParams {
    api: string
}

function run2(req: HttpRequest) {
    try {
        const query = req.query as unknown as any; //IMainQuery;
        const body = req.body as unknown as IMainBody;
        const params = req.params as unknown as IMainParams;

        switch (params.api) {
            case 'spotify':
                return {
                    spotify: true
                }
                break;
            case 'whatsapp':
                if(query['hub.token'] == 'vanjacloud') {
                    return {
                        challenge: query['hub.challenge']
                    }
                } else {
                    return {
                        error: 'invalid token'
                    }
                }
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
    const body = run2(req);

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