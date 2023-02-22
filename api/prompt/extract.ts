import { VercelRequest, VercelResponse } from "@vercel/node";
import { stringify } from "graph-selector";
import { confirmActiveSubscriptionFromToken } from "../_lib/_helpers";
import { openai } from "../_lib/_openai";
import { parseFlowchart } from "./_parseFlowchart";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // grab the bearer token from the request
    const token = req.headers.authorization;
    const isValidCustomer = confirmActiveSubscriptionFromToken(token);
    if (!isValidCustomer)
      return res.status(401).json({ error: "unauthorized" });

    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "no prompt provided" });

    const response = await openai.createCompletion({
      prompt: getPrompt(prompt),
      max_tokens: 2048,
      temperature: 0.5,
      model: "text-davinci-003",
    });

    const text = response.data.choices[0].text;
    if (!text) return res.status(400).json({ error: "no text provided" });

    const graph = parseFlowchart(text);
    const chart = `${stringify(
      graph
    )}\n\n=====\n{"parser":"graph-selector"}\n=====`;

    res.status(200).json({ chart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal server error" });
  }
}

function getPrompt(prompt: string) {
  return `Given textual information, extract the entities and relationships using the following syntax:
Entity {relationship} Entity

Each connection should appear on a new line.
An edge can be labeled like this:
Moon {orbits} Earth

Information:
Joseph is Richard's son. Mary is Richard's wife. Nathaniel is Joseph's auto-mechanic.

Relationships:
Richard {son} Joseph
Richard {wife} Mary
Joseph {auto-mechanic} Nathaniel

Information:
England fought France in the Hundred Years War. France fought England in the Anglo-French War. England fought Scotland in the War of the Roses. Scotland fought England in the Scottish-English War. England fought Scotland again during the Wars of Scottish Independence. France fought Scotland during the Hundred Years War.

Relationships:
England {Hundred Years War} France
France {Anglo-French War} England
England {War of the Roses} Scotland
Scotland {Scottish-English War} England
England {Wars of Scottish Independence} Scotland
France {Hundred Years War} Scotland

Information:
${prompt}

Flowchart:
`;
}
