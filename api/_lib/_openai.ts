import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("No OpenAI API key provided");

export const openai = new OpenAI({
  apiKey,
});
