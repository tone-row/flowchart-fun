import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Folder } from "phosphor-react";
import { useState } from "react";
import { Content, Overlay } from "../../ui/Dialog";
import { Button2, Input } from "../../ui/Shared";
import { ChartItem } from "./types";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChartItem | null;
  onConfirm: () => void;
}

export function DeleteModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: DeleteModalProps) {
  if (!item) return null;

  const isFolder = item.type === "folder";
  const hasFolderItems = isFolder && (item as any).items.length > 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Overlay />
        <Content className="max-w-md">
          <Dialog.Title className="text-lg font-bold mb-2">
            <Trans>Delete {isFolder ? "Folder" : "Flowchart"}</Trans>
          </Dialog.Title>

          <Dialog.Description className="text-neutral-600 dark:text-neutral-400 mb-4">
            {isFolder ? (
              hasFolderItems ? (
                <Trans>
                  Are you sure you want to delete the folder "{item.name}" and
                  all its contents? This action cannot be undone.
                </Trans>
              ) : (
                <Trans>
                  Are you sure you want to delete the folder "{item.name}"? This
                  action cannot be undone.
                </Trans>
              )
            ) : (
              <Trans>
                Are you sure you want to delete the flowchart "{item.name}"?
                This action cannot be undone.
              </Trans>
            )}
          </Dialog.Description>

          <div className="flex justify-between">
            <Button2 onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button2>
            <Button2 color="red" onClick={onConfirm}>
              <Trans>Delete</Trans>
            </Button2>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface CloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChartItem | null;
  onConfirm: (newName: string) => void;
}

export function CloneModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: CloneModalProps) {
  const [name, setName] = useState("");

  if (!item || item.type === "folder") return null;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setName(`${item.name} (Copy)`);
        }
        onClose();
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content className="max-w-md">
          <Dialog.Title className="text-lg font-bold mb-2">
            <Trans>Clone Flowchart</Trans>
          </Dialog.Title>

          <Dialog.Description className="text-neutral-600 dark:text-neutral-400 mb-4">
            <Trans>Enter a name for the cloned flowchart.</Trans>
          </Dialog.Description>

          <div className="mb-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Flowchart name"
              className="w-full"
            />
          </div>

          <div className="flex justify-between">
            <Button2 onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button2>
            <Button2
              color="blue"
              onClick={() => onConfirm(name)}
              disabled={!name.trim()}
            >
              <Trans>Clone</Trans>
            </Button2>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChartItem | null;
  onConfirm: (newName: string) => void;
}

export function RenameModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: RenameModalProps) {
  const [name, setName] = useState("");

  if (!item) return null;

  const isFolder = item.type === "folder";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setName(item.name);
        }
        onClose();
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content className="max-w-md">
          <Dialog.Title className="text-lg font-bold mb-2">
            <Trans>Rename {isFolder ? "Folder" : "Flowchart"}</Trans>
          </Dialog.Title>

          <Dialog.Description className="text-neutral-600 dark:text-neutral-400 mb-4">
            <Trans>
              Enter a new name for the {isFolder ? "folder" : "flowchart"}.
            </Trans>
          </Dialog.Description>

          <div className="mb-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isFolder ? "Folder name" : "Flowchart name"}
              className="w-full"
            />
          </div>

          <div className="flex justify-between">
            <Button2 onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button2>
            <Button2
              color="blue"
              onClick={() => onConfirm(name)}
              disabled={!name.trim()}
            >
              <Trans>Rename</Trans>
            </Button2>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function NewFolderModal({
  isOpen,
  onClose,
  onConfirm,
}: NewFolderModalProps) {
  const [name, setName] = useState("");

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setName("");
        }
        onClose();
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content className="max-w-md">
          <Dialog.Title className="text-lg font-bold mb-2">
            <Trans>New Folder</Trans>
          </Dialog.Title>

          <Dialog.Description className="text-neutral-600 dark:text-neutral-400 mb-4">
            <Trans>Enter a name for the new folder.</Trans>
          </Dialog.Description>

          <div className="mb-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
              className="w-full"
            />
          </div>

          <div className="flex justify-between">
            <Button2 onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button2>
            <Button2
              color="blue"
              onClick={() => onConfirm(name)}
              disabled={!name.trim()}
            >
              <Trans>Create</Trans>
            </Button2>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChartItem | null;
  folders: ChartItem[]; // List of all folders
  onConfirm: (destinationFolderId: string | null) => void;
}

export function MoveModal({
  isOpen,
  onClose,
  item,
  folders,
  onConfirm,
}: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  if (!item) return null;

  const isFolder = item.type === "folder";

  // Recursive function to render folders with proper indentation
  const renderFolderList = (folderList: ChartItem[], level = 0) => {
    return folderList
      .filter((folder) => folder.type === "folder" && folder.id !== item.id)
      .map((folder) => {
        // Skip rendering the current item and its children to prevent circular references
        const cannotBeMovedInto =
          isFolder &&
          ((folder as any).items || []).some(
            (f: ChartItem) =>
              f.id === item.id ||
              (f.type === "folder" &&
                (f as any).items.some((c: ChartItem) => c.id === item.id))
          );

        if (cannotBeMovedInto) return null;

        return (
          <div key={folder.id}>
            <div
              className={`
                p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800
                ${
                  selectedFolderId === folder.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }
              `}
              onClick={() => setSelectedFolderId(folder.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedFolderId(folder.id);
                }
              }}
              role="button"
              tabIndex={0}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              <div className="flex items-center gap-2">
                <Folder size={20} weight="fill" className="text-blue-500" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {folder.name}
                </span>
              </div>
            </div>

            {/* Render children folders recursively */}
            {folder.type === "folder" &&
              (folder as any).items?.length > 0 &&
              renderFolderList(
                (folder as any).items.filter(
                  (i: ChartItem) => i.type === "folder"
                ),
                level + 1
              )}
          </div>
        );
      });
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSelectedFolderId(null);
        }
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content className="max-w-md">
          <Dialog.Title className="text-lg font-bold mb-2">
            <Trans>Move {isFolder ? "Folder" : "Flowchart"}</Trans>
          </Dialog.Title>

          <Dialog.Description className="text-neutral-600 dark:text-neutral-400 mb-4">
            <Trans>Select a destination folder for "{item.name}".</Trans>
          </Dialog.Description>

          <div className="mb-4 max-h-60 overflow-y-auto border border-neutral-300 dark:border-neutral-700 rounded">
            {/* Option for root/no folder */}
            <div
              className={`
                p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800
                ${
                  selectedFolderId === null
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : ""
                }
              `}
              onClick={() => setSelectedFolderId(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedFolderId(null);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2">
                <Folder size={20} weight="fill" className="text-neutral-500" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  <Trans>No Folder (Root)</Trans>
                </span>
              </div>
            </div>

            {/* Render folders recursively */}
            {renderFolderList(folders)}
          </div>

          <div className="flex justify-between">
            <Button2 onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button2>
            <Button2 color="blue" onClick={() => onConfirm(selectedFolderId)}>
              <Trans>Move</Trans>
            </Button2>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
