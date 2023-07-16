// testable-http-triggered-function/__tests__/index.test.ts

import * as sut from './scrape'
import { ThoughtDB } from "vanjacloud.shared.js";
import keys from '../keys'
import moment from 'moment'

describe('scrape', () => {
    it.only('works', async () => {
        const db = new ThoughtDB(keys.notion, ThoughtDB.testdbid)

        const latest = db.getLatest(moment.duration(1, 'week'))
    })
})