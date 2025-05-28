"use server"

import { OpenAI } from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"


export type ChatMessage = {
    role: "user" | "assistant"
    content: string
  }
  
export async function chatWithAI(messages: ChatMessage[], botDescription?: string): Promise<string> {
    try {
        const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        });

        const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content: botDescription || 'You are a helpful assistant that helps users set up healthcare ingestion integrations.',
        };

        const formattedMessages: ChatCompletionMessageParam[] = [
        systemMessage,
        ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: formattedMessages,
            temperature: 0.2,
            max_tokens: 1000,
        });

        return response.choices[0].message.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('Error in chatWithAI:', error);
        throw new Error('Failed to process chat request');
    }
}