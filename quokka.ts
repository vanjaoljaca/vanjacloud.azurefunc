// testable-http-triggered-function/__tests__/index.test.ts

import run from './main/index'

async function test() {
    const res = await run({ test: 'blah' }, { id: 7 })
    console.log(res)
}

test();