import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ChatGPT, ThoughtDB } from "vanjacloud.shared.js";
import * as path from 'path';
import UrlPattern from 'url-pattern';
import axios from 'axios';
import * as fs from "fs";
import keys from "../keys";
import { LanguageTeacher } from "vanjacloud.shared.js";
import moment from "moment";

const systemPromptTemplate = fs.readFileSync('./content/systemprompt.template.md', 'utf8');
const blogSummary = fs.readFileSync('./content/blog1.summary.md', 'utf8');
const blogRaw = fs.readFileSync('./content/blog1.raw.md', 'utf8');

const systemPrompt =
    `${systemPromptTemplate}
    
    Introduction:
    ${blogSummary}
    
    Full Post:
    ${blogRaw}
    `

export interface IMainQuery {
    id: number;
}

export interface IMainBody {
    body: true
}

export interface IMainParams {
    route: string
}

export const Message = ChatGPT.Message;

interface WhatsAppMessage {
    object: string;
    entry: [{

// Rest of the code for the second API implementation

export async function api2(query: any, body: any, params: IMainParams) {
    // Implementation of the second API
}