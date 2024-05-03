import { MagicWand, Robot } from "phosphor-react";
import { Button2 } from "../ui/Shared";
import * as Popover from "@radix-ui/react-popover";
import { Trans, t } from "@lingui/macro";
import { useCallback, useRef, useState } from "react";
import { useDoc } from "../lib/useDoc";
import { parse, stringify, Graph as GSGraph } from "graph-selector";
import { useMutation } from "react-query";
import * as Toast from "@radix-ui/react-toast";
import { Microphone } from "./Microphone";
import { useHasProAccess } from "../lib/hooks";
import { showPaywall } from "../lib/usePaywallModalStore";

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

const title = t`Edit with AI`;
const content = t`With Flowchart Fun's Pro version, you can use natural language comamnds to quickly flesh out your flowchart details, ideal for creating diagrams on the go. For $6/month, get the ease of accessible AI editing to enhance your flowcharting experience.`;

export function EditWithAI() {
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const hasProAccess = useHasProAccess();

  const { mutate: edit, isLoading: editIsLoading } = useMutation({
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
    onSuccess(data) {
      if (data.message) {
        setMessage(data.message);
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
    onSettled() {
      setTranscriptionLoading(false);
    },
  });

  const submitPrompt = useCallback(
    (prompt: string) => {
      if (!hasProAccess) {
        showPaywall({
          title,
          content,
          imgUrl: "/images/ai-edit.png",
          toPricingCode: "EditWithAI",
        });
        return;
      }

      setIsOpen(false);

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
    [edit, hasProAccess]
  );

  const [txtPrompt, setTxtPrompt] = useState("");
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const prompt = formData.get("prompt") as string;
      if (!prompt) return;

      submitPrompt(prompt);
    },
    [submitPrompt]
  );

  const handleSend = useCallback(() => {
    if (hasProAccess) {
      setTranscriptionLoading(true);
      setIsOpen(false);
    } else {
      showPaywall({
        title,
        content,
        imgUrl: "/images/ai-edit.png",
        toPricingCode: "EditWithAI",
      });
      return;
    }
  }, [hasProAccess]);

  const formRef = useRef<HTMLFormElement>(null);

  const isLoading = editIsLoading || transcriptionLoading;

  return (
    <>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Button2
            leftIcon={
              <MagicWand
                className="group-hover-tilt-shaking md:-mr-1 -mr-4"
                size={18}
              />
            }
            color="purple"
            size="sm"
            rounded
            className="aria-[expanded=true]:bg-purple-700 !pt-2 !pb-[9px] !pl-3 !pr-4 disabled:!opacity-100"
            data-session-activity="Edit with AI: Open"
            isLoading={isLoading}
          >
            <span className="text-[15px] hidden md:inline">
              <Trans>Edit with AI</Trans>
            </span>
          </Button2>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            sideOffset={10}
            align="end"
            className="w-[300px] bg-white rounded-xl shadow border border-purple-300 p-2 !z-[100] animate-slideDownAndFade dark:bg-neutral-200 dark:text-neutral-800 dark:border-neutral-300"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              if (!formRef.current) return;

              // highlight the contexts of the textarea inside the form
              const textarea = formRef.current.querySelector("textarea");
              if (!textarea) return;

              textarea.focus();
              textarea.select();
            }}
          >
            <form className="grid gap-2" onSubmit={handleSubmit} ref={formRef}>
              <div className="relative">
                <textarea
                  placeholder={t`Write your prompt here or click to enable the microphone, then press and hold to record.`}
                  className="text-xs w-full resize-none h-24 p-2 leading-normal dark:bg-neutral-200"
                  name="prompt"
                  required
                  value={txtPrompt}
                  onChange={(e) => setTxtPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (!formRef.current) return;

                    // submit form on Enter
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      formRef.current.requestSubmit();
                    }
                  }}
                />
                <Microphone
                  onTranscription={submitPrompt}
                  onSend={handleSend}
                />
              </div>
              <Button2
                size="sm"
                color="purple"
                data-session-activity="Edit with AI: Submit"
              >
                <Trans>Submit</Trans>
              </Button2>
            </form>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <Toast.Root
        type="foreground"
        duration={generateDuration(message ?? "")}
        className="ToastRoot bg-zinc-300 text-zinc-700 border-b-2 border-r-2 border-zinc-500 rounded-md shadow p-4 grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={message !== null}
        onOpenChange={(open) => {
          if (!open) setMessage(null);
        }}
      >
        <Toast.Description>
          <div className="flex text-xs items-center gap-3">
            <Robot size={24} className="shrink-0" />
            <p className="leading-normal">{message}</p>
          </div>
        </Toast.Description>
      </Toast.Root>
    </>
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

/**
 * Pick a reading duration in milliseconds based on the length of the text.
 */
function generateDuration(text: string) {
  const words = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = words / wordsPerMinute;
  const duration = minutes * 60 * 1000;
  return Math.max(duration, 4000);
}
