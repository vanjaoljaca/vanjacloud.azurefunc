// testable-http-triggered-function/__tests__/index.test.ts

import run from './main/index'
// https://developers.notion.com/reference/intro
import keys from './keys';
import { Client } from "@notionhq/client"

// Initializing a client
const notion = new Client({
    auth: keys.notion
})

async function test() {
    const dbid = '1ccbf2c452d6453d94bc462a8c83c200'
    let res = await notion.databases.query({
        database_id: dbid,
    })
    console.log(res)
    let dbpage = await notion.pages.retrieve({
        page_id: res.results[0].id
    });

    return (res.results[0] as any).properties.Content.title[0].plain_text;
    return;

    const response = await notion.pages.create({
        cover: {
            type: "external",
            external: {
                url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
            }
        },
        icon: {
            type: "emoji",
            emoji: "🥬"
        },
        parent: {
            type: "database_id",
            database_id: dbid
        },
        properties: {
            title: [
                {
                    text: {
                        content: "Tuscan kale"
                    }
                }
            ]
        }
        // properties: {
        //     Name: {
        //         title: [
        //             {
        //                 text: {
        //                     content: "Tuscan kale"
        //                 }
        //             }
        //         ]
        //     },
        //     Description: {
        //         rich_text: [
        //             {
        //                 text: {
        //                     content: "A dark green leafy vegetable"
        //                 }
        //             }
        //         ]
        //     },
        //     "Food group": {
        //         select: {
        //             name: "🥬 Vegetable"
        //         }
        //     }
        // }
    })
    console.log(response)
}
test();