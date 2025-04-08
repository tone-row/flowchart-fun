import { Trans } from "@lingui/macro";
import {
  DotsThree,
  Folder,
  File,
  PencilSimple,
  Trash,
  Copy,
  CaretRight,
  CaretDown,
} from "phosphor-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { ChartItem } from "./types";
import { formatDate } from "../../lib/formatDate";

interface ChartListItemProps {
  item: ChartItem;
  onDelete: (item: ChartItem) => void;
  onClone: (item: ChartItem) => void;
  onRename: (item: ChartItem) => void;
  onOpen: (item: ChartItem) => void;
  level?: number;
}

export function ChartListItem({
  item,
  onDelete,
  onClone,
  onRename,
  onOpen,
  level = 0,
}: ChartListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === "folder";

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div
        className={`
          flex items-center justify-between p-3 rounded-md
          ${
            isFolder
              ? "bg-neutral-200/50 dark:bg-neutral-800/50"
              : "bg-white dark:bg-neutral-900"
          }
          hover:bg-neutral-200 dark:hover:bg-neutral-800
          cursor-pointer
          transition-colors
          border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700
        `}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => !isFolder && onOpen(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !isFolder && onOpen(item);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isFolder && (
            <button
              onClick={toggleExpand}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
            </button>
          )}

          <div className="flex items-center p-1 bg-white dark:bg-neutral-800 rounded">
            {isFolder ? (
              <Folder size={20} weight="fill" className="text-blue-500" />
            ) : (
              <File size={20} weight="fill" className="text-purple-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {item.name}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatDate(item.updatedAt)}{" "}
              {isFolder ? <Trans>(Folder)</Trans> : ""}
            </div>
          </div>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-300/50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <DotsThree size={20} weight="bold" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="end"
            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-lg rounded-md py-1 min-w-[150px] z-10"
          >
            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
              onClick={(e) => {
                e.stopPropagation();
                onRename(item);
              }}
            >
              <PencilSimple size={16} />
              <Trans>Rename</Trans>
            </DropdownMenu.Item>

            {!isFolder && (
              <DropdownMenu.Item
                className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onClone(item);
                }}
              >
                <Copy size={16} />
                <Trans>Clone</Trans>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="h-px bg-neutral-300 dark:bg-neutral-700 my-1" />

            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500 text-sm flex gap-2 items-center"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Trash size={16} />
              <Trans>Delete</Trans>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      {isFolder && isExpanded && (
        <div className="mt-1 space-y-1 mb-1">
          {(item as any).items.map((childItem: ChartItem) => (
            <ChartListItem
              key={childItem.id}
              item={childItem}
              onDelete={onDelete}
              onClone={onClone}
              onRename={onRename}
              onOpen={onOpen}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
