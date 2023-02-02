// testable-http-triggered-function/__tests__/index.test.ts

import { run, IMainBody, IMainQuery } from './index'
import * as azureStubs from 'stub-azure-function-context'
import assert = require('assert')
import keys from '../keys';
// todo: https://github.com/anthonychu/azure-functions-test-utils
import { backOff } from "exponential-backoff";
import { Configuration, OpenAIApi } from "openai"
import * as fs from 'fs';
import axios from 'axios';
import path = require('path');

// const ChatGPTAPI = require('chatgpt').ChatGPTAPI;
// import { ChatGPTAPI } from 'chatgpt'

// https://www.npmjs.com/package/openai
const configuration = new Configuration({
    apiKey: keys.openai,
});
const openai = new OpenAIApi(configuration);

async function withLocalCache<T>(filename: string, fn: () => Promise<any>): Promise<T> {
    if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    }

    if (process.env.GITHUB_ACTION) {
        throw new Error('Remote interaction disabled for CI tests. Check in snapshots instead.')
    }

    const result = await fn();
    const unwrapped = {
        data: result.data,
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        config: result.config
    }

    fs.writeFileSync(filename, JSON.stringify(unwrapped))

    return result;
}

async function testOpenAI(version: number, prompt: string) {
    const promptHash = Buffer.from(prompt).toString('base64')
    const destfolder = path.join('./testdata/openai/', version.toString())
    const filename = path.join(destfolder, 'response.' + promptHash + '.json')

    return withLocalCache(filename, () =>
        openai.createCompletion({
            model: "text-davinci-00" + version,
            prompt: prompt,
        })
    );
}

describe('openai', () => {
    it('can do basic stuff', async () => {
        const prompt = "A single word synonym for test: "
        let r2 = await testOpenAI(2, prompt)
        let r3 = await testOpenAI(3, prompt)
    })
})

describe('azure function handler', () => {
    it('can do basic stuff', async () => {

        let res = await invokeMain({ test: 'blah' }, { id: 7 })
        assert.ok(res);
    })
})

async function invokeMain(params: IMainBody, query: IMainQuery) {
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
                    {},
                    {},
                    params,
                    query,
                ),
            },
            { type: 'http', name: '$return', direction: 'out' },
        ],
        new Date(),
    )
}