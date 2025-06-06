"use server"

import { WorklistDefinition } from "@/types/worklist"
import { OpenAI } from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"


export type ChatMessage = {
    role: "user" | "assistant"
    content: string
  }

// TODO: Move this to the backend service
/**
 * TODO start using proper FHIR to extract the data structure
 * https://awellhealth.slack.com/archives/C06JLPNJZMG/p1748532575499539?thread_ts=1748525675.878809&cid=C06JLPNJZMG
 */
 export const columnAiAssistantMessageHandler = async (messages: ChatMessage[], data: any[], currentDefinition?: WorklistDefinition): Promise<{ response: string, needsDefinitionUpdate: boolean, definition?: WorklistDefinition }> => {
    const prompt = `You are a helpful assistant that helps users add columns to their view.
            
            Current worklist definition:
            ${JSON.stringify(currentDefinition, null, 2)}
            
            All the data is FHIR data.Available data: 
            ${JSON.stringify(data.slice(0, 10), null, 2)}
            
            Your task is to:
            1. Explain what columns are possible to add based on the available data, please provide field based arrays and fields inside arrays as well. For tasks insure you provide all inputs. Do not provide the fhirpath syntax at this stage.
            2. Help users understand what each field represents
            3. Tell them that they can ask for whatever column they want and you will do it. Never suggest an json unless the user asks for a change to the worklist definition.
            4. When suggesting changes, include a complete updated worklist definition in JSON with the following structure:
            {
            "title": "A clear title for this worklist",
            "taskViewColumns": [
                    {
                        "id": "column_id", // a unique identifier for the column
                        "name": "column_name", // the name of the column
                        "type": "data_type", // Must be one of: "string" | "number" | "date" | "boolean" | "tasks" | "select" | "array"
                        "key": "field_name", // Must exist in the data structure and must use the fhirpath syntax to access the data
                        "description": "Brief description of what this column represents"
                    }
                ],
                "patientViewColumns": [
                    {
                        "id": "column_id", // a unique identifier for the column
                        "name": "column_name", // the name of the column
                        "type": "data_type", // Must be one of: "string" | "number" | "date" | "boolean" | "tasks" | "select" | "array"
                        "key": "field_name", // Must exist in the data structure and must use the fhirpath syntax to access the data
                        "description": "Brief description of what this column represents"
                    }
                ]
            }
                
            For date manipulation, you can use only the following functions as none of the others are supported:
            - addSeconds(date, seconds) // if you need to add days, use seconds = days * 24 * 60 * 60, same applies for any other unit of time
            - subtractDates(date1, date2)
            - toDateLiteral(date)
            - now()
            - today()

            Arithmetic operations are supported for numbers.
            String operations are supported for strings, here is the full list:
            - str1 + str2
            - str1 & str2
            - str.substring(start, end)
            - str.replace(old, new)
            - str.matches(regex)
            - str.startsWith(prefix)
            - str.endsWith(suffix)
            - str.contains(substring)

            Be concise and clear in your explanations.
            When suggesting changes, always include the complete updated worklist definition in a JSON code block. Never add comments to the worklist JSON definition.
`
    const response = await chatWithAI(messages, prompt);

    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
        console.log("jsonMatch", jsonMatch)
        const updatedDefinition = JSON.parse(jsonMatch[1])
        console.log("updatedDefinition", updatedDefinition)

       return {
        response: response,
        needsDefinitionUpdate: true,
        definition: updatedDefinition
       }
    }
    return {
        response: response,
        needsDefinitionUpdate: false
    }
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

        console.log("Sending another message", messages[messages.length - 1])

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
