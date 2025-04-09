import { Trans } from "@lingui/macro";
import { FolderNotchPlus, Plus } from "phosphor-react";
import { Button2 } from "../../ui/Shared";

interface EmptyStateProps {
  onNewChart: () => void;
  onNewFolder: () => void;
  isFiltered?: boolean;
}

export function EmptyState({
  onNewChart,
  onNewFolder,
  isFiltered = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-neutral-200 dark:bg-neutral-800 rounded-full p-5 mb-4">
        <FolderNotchPlus
          size={40}
          weight="thin"
          className="text-neutral-500 dark:text-neutral-400"
        />
      </div>

      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
        {isFiltered ? (
          <Trans>No matching charts found</Trans>
        ) : (
          <Trans>No charts yet</Trans>
        )}
      </h3>

      <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
        {isFiltered ? (
          <Trans>
            Try adjusting your search or filters to find what you're looking
            for.
          </Trans>
        ) : (
          <Trans>
            Create a new flowchart to get started or organize your work with
            folders.
          </Trans>
        )}
      </p>

      {!isFiltered && (
        <div className="flex gap-4 flex-wrap justify-center">
          <Button2
            color="blue"
            leftIcon={<Plus size={16} />}
            onClick={onNewChart}
          >
            <Trans>New Flowchart</Trans>
          </Button2>

          <Button2
            leftIcon={<FolderNotchPlus size={16} />}
            onClick={onNewFolder}
          >
            <Trans>New Folder</Trans>
          </Button2>
        </div>
      )}
    </div>
  );
}
