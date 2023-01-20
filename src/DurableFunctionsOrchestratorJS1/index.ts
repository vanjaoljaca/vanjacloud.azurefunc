﻿/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

import * as df from "durable-functions"

const orchestrator = df.orchestrator(function* (context) {
    try {
        const outputs = [];

        // Replace "Hello" with the name of your Durable Activity Function.
        outputs.push(yield context.df.callActivity("Hello1", "Tokyo"));
        outputs.push(yield context.df.callActivity("Hello1", "Seattle"));
        outputs.push(yield context.df.callActivity("Hello1", "London"));

        // returns ["Hello Tokyo!", "Hello Seattle!", "Hello London!"]
        return outputs;
    } catch (error) {
        context.log.error(error);
        throw error;
    }
});

export default orchestrator;
