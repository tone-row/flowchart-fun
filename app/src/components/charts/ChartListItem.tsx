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
  ArrowSquareOut,
  FolderOpen,
  Link as LinkIcon,
} from "phosphor-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { ChartItem, FolderItem } from "./types";
import { formatDate } from "../../lib/formatDate";
import { useItemsByParentId } from "../../lib/folderQueries";
import { Link } from "react-router-dom";

interface ChartListItemProps {
  item: ChartItem;
  onDelete: (item: ChartItem) => void;
  onClone: (item: ChartItem) => void;
  onRename: (item: ChartItem) => void;
  onMove: (item: ChartItem) => void;
  onOpen: (item: ChartItem) => void;
  level?: number;
}

export function ChartListItem({
  item,
  onDelete,
  onClone,
  onRename,
  onMove,
  onOpen,
  level = 0,
}: ChartListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === "folder";
  const hasFetchedData = useRef(false);

  // Only fetch folder contents when this folder is expanded
  const { data: folderContents = [], isLoading } = useItemsByParentId(
    isFolder && isExpanded ? item.id : null
  );

  // Update the folder's items when we get new data
  useEffect(() => {
    // Only update folder contents if:
    // 1. It's a folder and it's expanded
    // 2. AND we have actual content OR we haven't fetched data before
    if (isFolder && isExpanded) {
      if (folderContents.length > 0) {
        (item as FolderItem).items = folderContents;
        hasFetchedData.current = true;
      } else if (!hasFetchedData.current) {
        // Only update with empty data if we haven't successfully fetched data before
        (item as FolderItem).items = folderContents;
      }
    }

    // Reset the ref when component unmounts
    return () => {
      if (isFolder) {
        hasFetchedData.current = false;
      }
    };
  }, [isFolder, isExpanded, folderContents, item]);

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded((prev) => !prev);
    } else {
      onOpen(item);
    }
  };

  const Clickable:
    | {
        element: "button";
        props: {
          onClick: () => void;
          onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
        };
      }
    | {
        element: typeof Link;
        props: {
          to: string;
        };
      } = isFolder
    ? {
        element: "button",
        props: {
          onClick: handleClick,
          onKeyDown(e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          },
        },
      }
    : { element: Link, props: { to: `/u/${item.id}` } };

  // Render appropriate content based on item type
  const renderItemContent = () => (
    <div
      className={`
        grid items-center grid-cols-[minmax(0,1fr)_auto] p-3 rounded-md w-full
        ${
          isFolder
            ? "bg-neutral-200/50 dark:bg-neutral-800/50"
            : "bg-white dark:bg-neutral-900"
        }
        hover:bg-neutral-200 dark:hover:bg-neutral-800
        cursor-pointer
        border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700
      `}
    >
      {/* @ts-ignore */}
      <Clickable.element
        {...Clickable.props}
        className="flex items-center gap-2 overflow-hidden"
      >
        {isFolder && (
          <span className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
            {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
          </span>
        )}

        <div className="flex items-center p-1 bg-white dark:bg-neutral-800 rounded">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={20} weight="fill" className="text-blue-500" />
            ) : (
              <Folder size={20} weight="fill" className="text-blue-500" />
            )
          ) : (
            <File size={20} weight="fill" className="text-purple-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-2">
            {item.name}
            {!isFolder && item.is_public && item.public_id && (
              <Link
                to={`/p/${item.public_id}`}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={(e) => e.stopPropagation()}
                title={`View public chart: ${item.name}`}
              >
                <LinkIcon size={16} />
              </Link>
            )}
          </div>
          {isFolder ? null : (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {formatDate(item.updatedAt)}{" "}
            </div>
          )}
        </div>
      </Clickable.element>

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

          <DropdownMenu.Item
            className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
            onClick={(e) => {
              e.stopPropagation();
              onMove(item);
            }}
          >
            <ArrowSquareOut size={16} />
            <Trans>Move</Trans>
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
  );

  return (
    <div className="animate-fadeIn">
      {renderItemContent()}

      {isFolder && isExpanded && (
        <div className="mt-1 space-y-1 mb-1 pl-6">
          {isLoading ? (
            <div className="p-3 text-neutral-500 dark:text-neutral-400 text-sm flex items-center gap-2 overflow-hidden">
              <div className="w-4 h-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-500 dark:border-t-neutral-400 rounded-full animate-spin"></div>
              <Trans>Loading...</Trans>
            </div>
          ) : folderContents.length > 0 ? (
            folderContents.map((childItem: ChartItem) => (
              <ChartListItem
                key={childItem.id}
                item={childItem}
                onDelete={onDelete}
                onClone={onClone}
                onRename={onRename}
                onMove={onMove}
                onOpen={onOpen}
                level={level + 1}
              />
            ))
          ) : (
            <div className="p-3 text-neutral-500 dark:text-neutral-400 text-sm italic">
              <Trans>No items in this folder</Trans>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
