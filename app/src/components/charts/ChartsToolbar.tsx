import { Trans } from "@lingui/macro";
import {
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  Plus,
  FolderPlus,
} from "phosphor-react";
import { useCallback } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button2 } from "../../ui/Shared";
import { SortConfig, SortOption } from "./types";

interface ChartsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
  onNewChart: () => void;
  onNewFolder: () => void;
}

export function ChartsToolbar({
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
  onNewChart,
  onNewFolder,
}: ChartsToolbarProps) {
  const toggleSortDirection = useCallback(() => {
    onSortChange({
      ...sortConfig,
      direction: sortConfig.direction === "asc" ? "desc" : "asc",
    });
  }, [sortConfig, onSortChange]);

  const handleSortOptionChange = useCallback(
    (sortBy: SortOption) => {
      onSortChange({
        ...sortConfig,
        sortBy,
      });
    },
    [sortConfig, onSortChange]
  );

  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-300 dark:border-neutral-800 mb-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search charts..."
            className="pl-10 p-2 bg-neutral-200 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
          />
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button2
              leftIcon={
                sortConfig.direction === "asc" ? (
                  <SortAscending size={16} />
                ) : (
                  <SortDescending size={16} />
                )
              }
              color="default"
              size="xs"
              className="ml-2"
            >
              <Trans>
                Sort by{" "}
                {sortConfig.sortBy === "createdAt"
                  ? "Created"
                  : sortConfig.sortBy === "updatedAt"
                  ? "Updated"
                  : "Name"}
              </Trans>
            </Button2>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-lg rounded-md py-1 min-w-[150px] z-10"
          >
            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
              onClick={() => handleSortOptionChange("name")}
            >
              <Trans>Name</Trans>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
              onClick={() => handleSortOptionChange("createdAt")}
            >
              <Trans>Created Date</Trans>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
              onClick={() => handleSortOptionChange("updatedAt")}
            >
              <Trans>Updated Date</Trans>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-neutral-300 dark:bg-neutral-700 my-1" />
            <DropdownMenu.Item
              className="px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm flex gap-2 items-center"
              onClick={toggleSortDirection}
            >
              {sortConfig.direction === "asc" ? (
                <>
                  <SortDescending size={16} />
                  <Trans>Sort Descending</Trans>
                </>
              ) : (
                <>
                  <SortAscending size={16} />
                  <Trans>Sort Ascending</Trans>
                </>
              )}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-center gap-2">
        <Button2
          color="blue"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={onNewChart}
        >
          <Trans>New Flowchart</Trans>
        </Button2>

        <Button2
          size="sm"
          leftIcon={<FolderPlus size={16} />}
          onClick={onNewFolder}
        >
          <Trans>New Folder</Trans>
        </Button2>
      </div>
    </div>
  );
}
