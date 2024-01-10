import { MagicWand, Microphone } from "phosphor-react";
import { Button2, IconButton2 } from "../ui/Shared";
import * as Popover from "@radix-ui/react-popover";
import { Trans, t } from "@lingui/macro";
import { useCallback, useRef, useState } from "react";
import { useDoc } from "../lib/useDoc";
import { parse, stringify, Graph as GSGraph } from "graph-selector";
import { useMutation } from "react-query";

// The Graph type we send to AI is slightly different from internal representation
type GraphForAI = {
  nodes: {
    label: string;
    id?: string;
  }[];
  edges: {
    label: string;
    from: string;
    to: string;
  }[];
};

export function EditWithAI() {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: edit, isLoading } = useMutation({
    mutationFn: async (body: { prompt: string; graph: GraphForAI }) => {
      // /api/prompt/edit
      const response = await fetch("/api/prompt/edit", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data as {
        message: string;
        toolCalls: {
          name: "updateGraph";
          args: GraphForAI;
        }[];
      };
    },
    onMutate: () => setIsOpen(false),
    onSuccess(data) {
      if (data.message) {
        window.alert(data.message);
      }

      for (const { name, args } of data.toolCalls) {
        switch (name) {
          case "updateGraph": {
            const newText = toGraphSelector(args);
            useDoc.setState({ text: newText }, false, "EditWithAI");
            break;
          }
        }
      }
    },
  });
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const prompt = formData.get("prompt") as string;
      if (!prompt) return;

      const text = useDoc.getState().text;
      const _graph = parse(text);

      const graph: GraphForAI = {
        nodes: _graph.nodes.map((node) => {
          if (isCustomID(node.data.id)) {
            return {
              label: node.data.label,
              id: node.data.id,
            };
          }

          return {
            label: node.data.label,
          };
        }),
        edges: _graph.edges.map((edge) => {
          // Because generated edges internally use a custom ID,
          // we need to find the label, unless the user is using a custom ID

          let from = edge.source;
          if (!isCustomID(from)) {
            // find the from node
            const fromNode = _graph.nodes.find((node) => node.data.id === from);
            if (!fromNode) throw new Error("from node not found");
            from = fromNode.data.label;
          }

          let to = edge.target;
          if (!isCustomID(to)) {
            // find the to node
            const toNode = _graph.nodes.find((node) => node.data.id === to);
            if (!toNode) throw new Error("to node not found");
            to = toNode.data.label;
          }

          return {
            label: edge.data.label,
            from,
            to,
          };
        }),
      };

      edit({ prompt, graph });
    },
    [edit]
  );

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button2
          leftIcon={
            <MagicWand className="group-hover-tilt-shaking" size={18} />
          }
          color="zinc"
          size="sm"
          rounded
          className="aria-[expanded=true]:bg-zinc-700"
          isLoading={isLoading}
        >
          <Trans>Edit with AI</Trans>
        </Button2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={10}
          align="center"
          className="w-[300px] bg-white rounded shadow border p-2"
        >
          <form className="grid gap-2" onSubmit={handleSubmit} ref={formRef}>
            <div className="relative">
              <textarea
                placeholder={t`Write your prompt here or press and hold the button to speak...`}
                className="text-xs w-full resize-none h-24 p-2 leading-normal"
                name="prompt"
                required
                onKeyDown={(e) => {
                  if (!formRef.current) return;

                  // submit form on Enter
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current.requestSubmit();
                  }
                }}
              />
              <IconButton2 size="xs" className="!absolute bottom-0 right-0">
                <Microphone size={16} />
              </IconButton2>
            </div>
            <Button2 size="sm" color="purple">
              <Trans>Submit</Trans>
            </Button2>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Match any string like "n1", "n23", "n902834"
export function isCustomID(id: string) {
  return !id.match(/^n\d+$/);
}

function toGraphSelector(graph: GraphForAI) {
  const g: GSGraph = {
    nodes: graph.nodes.map((node) => ({
      data: {
        id: node.label,
        label: node.label,
        classes: "",
      },
    })),
    edges: graph.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      data: {
        id: "",
        label: edge.label ?? "",
        classes: "",
      },
    })),
  };

  return stringify(g, { compact: true });
}
