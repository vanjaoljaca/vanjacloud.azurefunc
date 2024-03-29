// testable-http-triggered-function/__tests__/index.test.ts

import { IMainBody, IMainParams, IMainQuery, Message, run } from './index'
import * as azureStubs from 'stub-azure-function-context'
import assert from "assert";
// todo: https://github.com/anthonychu/azure-functions-test-utils
describe('azure function handler', () => {
    const paths = [
        '.well-known/ai-plugin.json',
        'img.png',
        'legal.txt',
        'openapi.yaml'
    ]
    it('static', async () => {
        for (const p of paths) {
            let res = await invokeMain(
                { route: p },
                { body: true }, { id: 7 })
            assert.ok(res);
        }
    })
    const badpaths = [
        '../ai-plugin.json',
    ]
    it('static', async () => {
        for (const p of badpaths) {
            let res = await invokeMain(
                { route: p },
                { body: true }, { id: 7 })
            assert.ok(res.body.startsWith('Invalid'));
        }
    })
})


describe('azure function handler', () => {
    it('can preferences', async () => {
        let res = await invokeMain(
            { route: 'api/main/chatgpt' },
            { body: true }, { id: 7 })

        assert(res.body?.error == null);
    })
})


describe('azure function handler', () => {
    it('can do basic stuff', async () => {
        let res = await invokeMain(
            { route: 'api/main/blah' },
            { body: true }, { id: 7 })
        assert.ok(res);
    })
})

describe('azure function handler', () => {
    jest.setTimeout(20000);

    it.only('retrospective', async () => {
        let res = await invokeMain(
            { route: 'api/main/retrospective' },
            { body: true }, { id: 7 })
        res //?
        assert.ok(res);
    })
})


describe('azure function handler', () => {
    xit('can chat', async () => {
        let res = await invokeMain(
            { route: 'api/main/chat' },
            {
                context: [
                    // Message.user('hi'),
                    // Message.system('hello'),
                ], message: 'give me the optimal prompt (5 of them) to interact with this content'
            },
            { id: 7 })
        // res //?
        console.log(res.body)//?
        assert.ok(res);
        assert.notEqual(res.body.response, null);
    })

    it('can chat context', async () => {
        let res = await invokeMain(
            { route: 'api/main/chat' },
            {
                context: [
                    Message.user('hi'),
                    Message.system('hello'),
                ], message: 'dont say hello'
            },
            { id: 7 })
        // res //?
        console.log(res.body)//?
        assert.ok(res);
        assert.notEqual(res.body.response, null);
    })
})

async function invokeMain(params: IMainParams, body: IMainBody & any, query: IMainQuery) {
    const headers = {}
    // This calls index.ts/run() via this stub wrapper
    return azureStubs.runStubFunctionFromBindings(
        run,
        [
            {
                type: 'httpTrigger',
                name: 'req',
                direction: 'in',
                data: azureStubs.createHttpTrigger(
                    'GET',
                    'http://example.com/counters/11',
                    headers,
                    params,
                    body,
                    query,
                ),
            },
            { type: 'http', name: '$return', direction: 'out' },
        ],
        new Date(),
    )
}