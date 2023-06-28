import { CompletionCreateParams } from "openai/resources/chat/completions";
import OpenAI from 'openai';

export class ChatGPT {
    readonly MODEL_NAME = 'gpt-3.5-turbo-16k';
    readonly messages: Array<CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Messages> = []

    constructor(private openai: OpenAI, systemPrompt: string) {
        this.messages = []
        this.messages.push({
            role: 'system',
            content: systemPrompt
        });
    }

    public async say(message: string): Promise<string> {
        this.messages.push({
            role: 'user',
            content: message
        });
        let response = await this.openai.chat.completions.create({
            model: this.MODEL_NAME,
            messages: this.messages
        });
        this.messages.push(response.choices[0].message);
        return response.choices[0].message.content;
    }
}