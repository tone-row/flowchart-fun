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
Is shoe on foot?
No: Put on shoe. Proceed to next step.
Yes: Proceed to next step.
Is shoe tied?
Yes: Success!
No: Tie Shoe. Success!

Relationships:
Is shoe on foot? {No} Put on shoe.
Is shoe on foot? {Yes} Is shoe tied?
Put on shoe. { } Is shoe tied?
Is shoe tied? {Yes} Success!
Is shoe tied? {No} Tie shoe.
Tie shoe. { } Success!

Information:
Take a jelly bean.
If the jelly bean is red, eat it.
If it's blue put it in Pot 1 then fry an egg and eat it.
If it's purple put it in Pot 2.
If your jelly bean is green stand up and clap three times.
Take another.
If you just put a jelly bean in Pot 1, eat it no matter what color it is.
If you just put a jelly bean in Pot 2, swap it for the one you just put in Pot 1.
If your jelly bean is orange, put it in Pot 3.
Repeat until you have no jelly beans left.

Relationships:
Take a jelly bean. { } If the jelly bean is red, eat it.
Take a jelly bean. { } If it's blue put it in Pot 1 then fry an egg and eat it.
Take a jelly bean. { } If it's purple put it in Pot 2.
Take a jelly bean. { } If your jelly bean is green stand up and clap three times.
If the jelly bean is red, eat it. { } Take another.
If it's blue put it in Pot 1 then fry an egg and eat it. { } Take another.
If it's purple put it in Pot 2. { } Take another.
If your jelly bean is green stand up and clap three times. { } Take another.
Take another. { } If you just put a jelly bean in Pot 1, eat it no matter what color it is.
Take another. { } If you just put a jelly bean in Pot 2, swap it for the one you just put in Pot 1.
Take another. { } If your jelly bean is orange, put it in Pot 3.
If you just put a jelly bean in Pot 1, eat it no matter what color it is. { } Repeat until you have no jelly beans left.
If you just put a jelly bean in Pot 2, swap it for the one you just put in Pot 1. { } Repeat until you have no jelly beans left.
If your jelly bean is orange, put it in Pot 3. { } Repeat until you have no jelly beans left.

Information:
Go to grocery store.
Buy horseradish. If there is no horse radish, go to farm. Buy horse.
If there are no horses on the farm. Go to market and buy seeds.
Go back to farm. Plant crops. When crops harvest, sell crops and buy horse.
When horse grows up, send horse to the grocery store to buy horseradish.
If the horse succeeds, enroll the horse in college.
If the horse fails, count your losses and remember the good times.

Relationships:
Go to grocery store. { } Buy horseradish.
Buy horseradish. {If there is no horse radish} Go to farm. Buy horse.
Go to farm. Buy horse. {If there are no horses on the farm} Go to market and buy seeds.
Go to market and buy seeds. { } Go back to farm. Plant crops.
Go back to farm. Plant crops. {When crops harvest} Sell crops and buy horse.
Sell crops and buy horse. {When horse grows up} Send horse to the grocery store to buy horseradish.
Send horse to the grocery store to buy horseradish. {If the horse succeeds} Enroll the horse in college.
Send horse to the grocery store to buy horseradish. {If the horse fails} Count your losses and remember the good times.

Information:
${prompt}

Flowchart:
`;
}
