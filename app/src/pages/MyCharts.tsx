import { Trans } from "@lingui/macro";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../components/AppContextProvider";
import { ChartsToolbar } from "../components/charts/ChartsToolbar";
import { ChartListItem } from "../components/charts/ChartListItem";
import {
  DeleteModal,
  CloneModal,
  RenameModal,
  NewFolderModal,
  MoveModal,
} from "../components/charts/ChartModals";
import { EmptyState } from "../components/charts/EmptyState";
import { ChartItem, SortConfig } from "../components/charts/types";
import { ArrowRight } from "phosphor-react";
import { Button2 } from "../ui/Shared";
import {
  useItemsByParentId,
  useCreateFolder,
  useDeleteFolder,
  useDeleteChart,
  useRenameFolder,
  useRenameChart,
  useMoveFolder,
  useMoveChart,
  useCloneChart,
} from "../lib/folderQueries";
import { useMemo } from "react";

// Component for the main page title
function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
      {children}
    </h1>
  );
}

export default function MyCharts() {
  const navigate = useNavigate();
  const { session } = useContext(AppContext);
  const userId = session?.user?.id;

  // State for folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Fetch data using the query hook
  const {
    data: chartItems = [],
    isLoading: loading,
    error,
  } = useItemsByParentId(currentFolderId);

  // State for search and sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    sortBy: "updatedAt",
    direction: "desc",
  });

  // State for modal interactions
  const [deleteModalItem, setDeleteModalItem] = useState<ChartItem | null>(
    null
  );
  const [cloneModalItem, setCloneModalItem] = useState<ChartItem | null>(null);
  const [renameModalItem, setRenameModalItem] = useState<ChartItem | null>(
    null
  );
  const [moveModalItem, setMoveModalItem] = useState<ChartItem | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  // Setup mutation hooks
  const deleteFolder = useDeleteFolder();
  const deleteChart = useDeleteChart();
  const renameFolder = useRenameFolder();
  const renameChart = useRenameChart();
  const moveFolder = useMoveFolder();
  const moveChart = useMoveChart();
  const cloneChart = useCloneChart();
  const createFolder = useCreateFolder();

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return chartItems;

    const query = searchQuery.toLowerCase();
    return chartItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [chartItems, searchQuery]);

  // Sort items
  const filteredAndSortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortConfig.sortBy];
      const bValue = b[sortConfig.sortBy];

      if (sortConfig.sortBy === "name") {
        const comparison = (a.name || "").localeCompare(b.name || "");
        return sortConfig.direction === "asc" ? comparison : -comparison;
      } else {
        const comparison =
          new Date(bValue).getTime() - new Date(aValue).getTime();
        return sortConfig.direction === "asc" ? -comparison : comparison;
      }
    });
  }, [filteredItems, sortConfig]);

  // Handlers for chart operations
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteModalItem) return;

    if (deleteModalItem.type === "folder") {
      deleteFolder.mutate({ id: deleteModalItem.id });
    } else {
      deleteChart.mutate({ id: deleteModalItem.id });
    }

    setDeleteModalItem(null);
  }, [deleteModalItem, deleteFolder, deleteChart]);

  const handleCloneConfirm = useCallback(
    (newName: string) => {
      if (!cloneModalItem || cloneModalItem.type !== "chart" || !userId) return;

      cloneChart.mutate({
        id: cloneModalItem.id,
        newName,
        userId,
      });

      setCloneModalItem(null);
    },
    [cloneModalItem, cloneChart, userId]
  );

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (!renameModalItem) return;

      if (renameModalItem.type === "folder") {
        renameFolder.mutate({
          id: renameModalItem.id,
          name: newName,
        });
      } else {
        renameChart.mutate({
          id: renameModalItem.id,
          name: newName,
        });
      }

      setRenameModalItem(null);
    },
    [renameModalItem, renameFolder, renameChart]
  );

  const handleMoveConfirm = useCallback(
    (destinationFolderId: string | null) => {
      if (!moveModalItem) return;

      if (moveModalItem.type === "folder") {
        moveFolder.mutate({
          id: moveModalItem.id,
          newParentId: destinationFolderId,
        });
      } else {
        moveChart.mutate({
          id: moveModalItem.id,
          newFolderId: destinationFolderId,
        });
      }

      setMoveModalItem(null);
    },
    [moveModalItem, moveFolder, moveChart]
  );

  const handleNewFolderConfirm = useCallback(
    (name: string) => {
      if (!userId) return;

      createFolder.mutate({
        name,
        parent_id: currentFolderId,
        user_id: userId,
      });

      setIsNewFolderModalOpen(false);
    },
    [currentFolderId, createFolder, userId]
  );

  const handleOpenChart = useCallback(
    (item: ChartItem) => {
      if (item.type === "chart") {
        navigate(`/chart/${item.id}`);
      } else if (item.type === "folder") {
        // Navigate to folder
        setCurrentFolderId(item.id);
      }
    },
    [navigate]
  );

  const handleJumpToSandbox = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleNewChart = useCallback(() => {
    navigate("/new");
  }, [navigate]);

  // Get all folders for the move modal (for the folder selector)
  const allFolders = useMemo(() => {
    return chartItems.filter((item) => item.type === "folder");
  }, [chartItems]);

  if (error) {
    return (
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <div className="text-red-600 p-4 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400">
          <p>Error loading charts: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mt-8">
        <PageTitle>
          <Trans>Your Charts</Trans>
        </PageTitle>
        <Button2
          color="default"
          size="sm"
          rightIcon={<ArrowRight size={16} />}
          onClick={handleJumpToSandbox}
          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
        >
          <Trans>Go to your Sandbox</Trans>
        </Button2>
      </div>

      <ChartsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        onNewChart={handleNewChart}
        onNewFolder={() => setIsNewFolderModalOpen(true)}
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse space-y-4 w-full">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-md"
              />
            ))}
          </div>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <EmptyState
          onNewChart={handleNewChart}
          onNewFolder={() => setIsNewFolderModalOpen(true)}
          isFiltered={searchQuery.trim() !== ""}
        />
      ) : (
        <div className="space-y-2 mt-6">
          {filteredAndSortedItems.map((item) => (
            <ChartListItem
              key={item.id}
              item={item}
              onDelete={setDeleteModalItem}
              onClone={setCloneModalItem}
              onRename={setRenameModalItem}
              onMove={setMoveModalItem}
              onOpen={handleOpenChart}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        item={deleteModalItem}
        onConfirm={handleDeleteConfirm}
      />

      <CloneModal
        isOpen={!!cloneModalItem}
        onClose={() => setCloneModalItem(null)}
        item={cloneModalItem}
        onConfirm={handleCloneConfirm}
      />

      <RenameModal
        isOpen={!!renameModalItem}
        onClose={() => setRenameModalItem(null)}
        item={renameModalItem}
        onConfirm={handleRenameConfirm}
      />

      <MoveModal
        isOpen={!!moveModalItem}
        onClose={() => setMoveModalItem(null)}
        item={moveModalItem}
        folders={allFolders}
        onConfirm={handleMoveConfirm}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onConfirm={handleNewFolderConfirm}
      />
    </div>
  );
}
