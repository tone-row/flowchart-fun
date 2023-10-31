import { VercelApiHandler } from "@vercel/node";
import { Schema } from "ajv";
import { openai } from "../_lib/_openai";
import { stringify } from "graph-selector";

type PromptType = "knowledge" | "flowchart";

export const maxDuration = 60 * 5; // 5 minutes

const handler: VercelApiHandler = async (req, res) => {
  const { subject, promptType, accentClasses = [] } = req.body;
  if (!subject || !promptType || !isPromptType(promptType)) {
    res.status(400).json({
      error: "Missing required fields",
    });
    return;
  }

  const text = await completionFunctions[promptType](subject, accentClasses);

  res.status(200).json({
    text,
  });
};

export default handler;

function isPromptType(arg: string): arg is PromptType {
  return arg === "knowledge" || arg === "flowchart";
}

const completionFunctions = {
  flowchart: getFlowchartCompletion,
  knowledge: getKnowledgeCompletion,
};

async function getFlowchartCompletion(
  subject: string,
  accentClasses: string[]
) {
  const temperature = 0.2;
  const model = "gpt-4-0613";
  const output: Schema = {
    type: "object",
    properties: {
      nodes: {
        type: "array",
        description: "List of nodes in the knowledge graph",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the node in slug format",
            },
            label: {
              type: "string",
              description: "Label for the node",
            },
            classes: {
              type: "string",
              description: "Optional style classes for the node",
            },
          },
          required: ["id", "label"],
        },
      },
      edges: {
        type: "array",
        description: "List of edges in the knowledge graph",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Label for the edge",
            },
            source: {
              type: "string",
              description: "Origin node ID",
            },
            target: {
              type: "string",
              description: "Destination node ID",
            },
          },
          required: ["source", "target"],
        },
      },
    },
    required: ["nodes", "edges"],
  };

  let prompt = `Create a detailed flowchart to help me convey the following process. `;

  // Add accent classes if passed
  if (accentClasses.length > 0) {
    prompt += `You can very sparingly use these classes to accent nodes if it adds to the visualization: ${accentClasses.join(
      ", "
    )}. `;
  }
  prompt += `Process: \n`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${prompt}${subject}`,
      },
    ],
    model,
    function_call: { name: "flowchart" },
    temperature,
    functions: [
      {
        name: "flowchart",
        description: `Generate a flowchart with nodes and edges.`,
        parameters: output,
      },
    ],
  });

  const completionValue =
    chatCompletion.choices[0].message.function_call?.arguments;
  if (!completionValue) {
    throw new Error("No completion value");
  }

  const graph = JSON.parse(completionValue) as {
    nodes: {
      id: string;
      label: string;
      classes: string;
    }[];
    edges: {
      label: string;
      source: string;
      target: string;
    }[];
  };

  const graphStr = stringify({
    nodes: graph.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        classes: node.classes ?? "",
      },
    })),
    edges: graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      data: {
        id: "",
        label: edge.label ?? "",
        classes: "",
      },
    })),
  });

  return graphStr;
}
async function getKnowledgeCompletion(
  subject: string,
  accentClasses: string[]
) {
  const temperature = 0.2;

  let prompt = ``;

  // Add accent classes if passed
  if (accentClasses.length > 0) {
    prompt += `Use the following classes extremely sparingly on nodes, only when it helps with readability: ${accentClasses.join(
      ", "
    )}. `;
  }
  prompt += `Build a detailed knowledge graph that helps me understand the following: \n`;

  const output: Schema = {
    type: "object",
    properties: {
      nodes: {
        type: "array",
        description: "List of nodes in the knowledge graph",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the node in slug format",
            },
            label: {
              type: "string",
              description: "Label for the node",
            },
            classes: {
              type: "string",
              description: "Optional style classes for the node",
            },
          },
          required: ["id", "label"],
        },
      },
      edges: {
        type: "array",
        description: "List of edges in the knowledge graph",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Label for the edge",
            },
            source: {
              type: "string",
              description: "Origin node ID",
            },
            target: {
              type: "string",
              description: "Destination node ID",
            },
          },
          required: ["source", "target"],
        },
      },
    },
    required: ["nodes", "edges"],
  };

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${prompt}${subject}`,
      },
    ],
    model: "gpt-4-0613",
    function_call: { name: "graph" },
    temperature,
    functions: [
      {
        name: "graph",
        description: `Generate a knowledge graph with entities and relationships.`,
        parameters: output,
      },
    ],
  });

  const completionValue =
    chatCompletion.choices[0].message.function_call?.arguments;

  if (!completionValue) {
    throw new Error("No completion value");
  }

  const graph = JSON.parse(completionValue) as {
    nodes: {
      id: string;
      label: string;
      classes: string;
    }[];
    edges: {
      label: string;
      source: string;
      target: string;
    }[];
  };

  const graphStr = stringify({
    nodes: graph.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        classes: node.classes ?? "",
      },
    })),
    edges: graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      data: {
        id: "",
        label: edge.label ?? "",
        classes: "",
      },
    })),
  });

  return graphStr;
}
