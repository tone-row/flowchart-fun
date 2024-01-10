/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from "zod";
import { openai } from "./_openai";
import zodToJsonSchema from "zod-to-json-schema";
import OpenAI from "openai";

type Schemas<T extends Record<string, ZodObject<any>>> = T;

export async function llmMany<T extends Record<string, ZodObject<any>>>(
  content: string,
  schemas: Schemas<T>
) {
  try {
    // if the user passes a key "message" in schemas, throw an error
    if (schemas.message) throw new Error("Cannot use key 'message' in schemas");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content,
        },
      ],
      tools: Object.entries(schemas).map(([key, schema]) => ({
        type: "function",
        function: {
          name: key,
          parameters: zodToJsonSchema(schema),
        },
      })),
      model: "gpt-3.5-turbo-1106",
      // model: "gpt-4-1106-preview",
    });

    const choice = completion.choices[0];

    if (!choice) throw new Error("No choices returned");

    // Must return the full thing, message and multiple tool calls
    return simplifyChoice(choice) as SimplifiedChoice<T>;
  } catch (error) {
    console.error(error);
    const message = (error as Error)?.message || "Error with prompt";
    throw new Error(message);
  }
}

type SimplifiedChoice<T extends Record<string, ZodObject<any>>> = {
  message: string;
  toolCalls: Array<
    {
      [K in keyof T]: {
        name: K;
        args: z.infer<T[K]>;
      };
    }[keyof T]
  >;
};

function simplifyChoice(choice: OpenAI.Chat.Completions.ChatCompletion.Choice) {
  return {
    message: choice.message.content || "",
    toolCalls:
      choice.message.tool_calls?.map((toolCall) => ({
        name: toolCall.function.name,
        // Wish this were type-safe!
        args: JSON.parse(toolCall.function.arguments ?? "{}"),
      })) || [],
  };
}
