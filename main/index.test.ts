// testable-http-triggered-function/__tests__/index.test.ts

import { run, IMainBody, IMainQuery } from './index'
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