import { Configuration, OpenAIApi } from "openai";

const apiKey = process.env.OPENAI_SECRET;
if (!apiKey) throw new Error("No OpenAI API key provided");

const configuration = new Configuration({
  apiKey,
});

export const openai = new OpenAIApi(configuration);
