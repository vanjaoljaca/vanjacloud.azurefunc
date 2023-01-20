// testable-http-triggered-function/__tests__/index.test.ts

import * as sut from './scrape'

describe('scrape', () => {
    it('works', async () => {
        sut.mostActive();
    })
})