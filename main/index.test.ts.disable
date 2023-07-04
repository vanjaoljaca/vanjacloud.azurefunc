// testable-http-triggered-function/__tests__/index.test.ts

import { run, IMainBody, IMainQuery, IMainParams, Message } from './index'
import * as azureStubs from 'stub-azure-function-context'
import assert = require('assert')
// todo: https://github.com/anthonychu/azure-functions-test-utils
import { backOff } from "exponential-backoff";
import * as fs from 'fs';
import axios from 'axios';
import path = require('path');



import MyModule from 'vanjacloudjs.shared';
import keys from "../keys";
console.log(MyModule.myThing)


describe('azure function handler', () => {
    const paths = [
        '.well-known/ai-plugin.json',
        'img.png',
        'legal.txt',
        'openapi.yaml'
    ]
    it.only('static', async () => {
        for (const p of paths) {
            let res = await invokeMain(
                { route: p },
                { body: true }, { id: 7 })
            assert.ok(res);
        }
    })
})


describe('azure function handler', () => {
    it('can preferences', async () => {
        let res = await invokeMain(
            { route: 'api/main/preferences' },
            { body: true }, { id: 7 })
        assert.ok(res);
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
    it('can chat', async () => {
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