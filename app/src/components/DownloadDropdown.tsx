import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FileImage, Image, Copy, Check } from "phosphor-react";
import { useHasProAccess, useDownloadFilename } from "../lib/hooks";
import { AUTH_IMG_SCALE, UNAUTH_IMG_SCALE } from "../lib/constants";
import { downloadCanvas, downloadSvg, getCanvas, getSvg } from "./downloads";
import { t } from "@lingui/macro";
import { showPaywall } from "../lib/usePaywallModalStore";
import { useState } from "react";
import * as Toast from "@radix-ui/react-toast";

export function DownloadDropdown({ children }: { children: React.ReactNode }) {
  const hasProAccess = useHasProAccess();
  const filename = useDownloadFilename();
  const watermark = !hasProAccess;
  const scale = hasProAccess ? AUTH_IMG_SCALE : UNAUTH_IMG_SCALE;

  // store a string for a recently completed action we will use to show a checkmark in certain cases
  const [message, setMessage] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    if (!window.__cy) return;

    if (format === "svg" && hasProAccess) {
      const svg = await getSvg({ cy: window.__cy });
      downloadSvg({ svg, filename });
    } else {
      const { canvas } = await getCanvas({
        cy: window.__cy,
        type: format as "png" | "jpg",
        watermark,
        scale,
      });
      downloadCanvas({
        canvas,
        filename,
        type: format as "png" | "jpg",
        cleanup: () => {},
      });
    }
  };

  const handleCopy = async (format: string) => {
    if (!window.__cy) return;

    // if the type is svg, copy code
    if (format === "svg") {
      const svg = await getSvg({ cy: window.__cy });
      navigator.clipboard.writeText(svg);
      setMessage(t`Copied SVG code to clipboard`);
      return;
    }

    const { canvas } = await getCanvas({
      cy: window.__cy,
      type: format as "png" | "jpg",
      watermark,
      scale,
    });

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          console.log(`Copied ${format} to clipboard`);
          setMessage(t`Copied ${format} to clipboard`);
        } catch (err) {
          console.error(`Failed to copy ${format}:`, err);
        }
      }
    }, `image/${format}`);
  };

  const handleSvgAction = (action: "download" | "copy") => {
    if (hasProAccess) {
      action === "download" ? handleDownload("svg") : handleCopy("svg");
    } else {
      showPaywall({
        title: t`SVG Export is a Pro Feature`,
        content: t`Upgrade to Flowchart Fun Pro to unlock SVG exports and enjoy more advanced features for your diagrams.`,
        toPricingCode: "SVGExport",
      });
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
        <DropdownMenu.Content
          side="bottom"
          sideOffset={5}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg p-1 min-w-[160px]"
        >
          <DropdownMenuItem onClick={() => handleDownload("png")} icon={Image}>
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("jpg")} icon={Image}>
            Download JPG
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSvgAction("download")}
            icon={FileImage}
          >
            Download SVG
          </DropdownMenuItem>
          <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
          <DropdownMenuItem onClick={() => handleCopy("png")} icon={Copy}>
            Copy PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopy("jpg")} icon={Copy}>
            Copy JPG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSvgAction("copy")} icon={Copy}>
            Copy SVG
          </DropdownMenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Toast.Root
        type="foreground"
        duration={3000}
        className="ToastRoot bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-md shadow-md dark:shadow-lg p-4 grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={message !== null}
        onOpenChange={(open) => {
          if (!open) setMessage(null);
        }}
      >
        <Toast.Description>
          <div className="flex text-xs items-center gap-3 text-neutral-800 dark:text-neutral-200">
            <Check
              size={24}
              className="shrink-0 text-green-500 dark:text-green-400"
            />
            <p className="leading-normal">{message}</p>
          </div>
        </Toast.Description>
      </Toast.Root>
    </>
  );
}

function DropdownMenuItem({
  children,
  icon: Icon,
  ...props
}: DropdownMenu.DropdownMenuItemProps & {
  icon: typeof Image;
}) {
  return (
    <DropdownMenu.Item
      className="flex items-center px-2 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
      {...props}
    >
      <Icon className="mr-2" size={18} />
      {children}
    </DropdownMenu.Item>
  );
}
