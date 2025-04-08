import { Trans } from "@lingui/macro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartsToolbar } from "../components/charts/ChartsToolbar";
import { ChartListItem } from "../components/charts/ChartListItem";
import {
  DeleteModal,
  CloneModal,
  RenameModal,
  NewFolderModal,
} from "../components/charts/ChartModals";
import { EmptyState } from "../components/charts/EmptyState";
import { ChartItem, SortConfig } from "../components/charts/types";
import {
  filterChartItems,
  generateMockChartData,
  sortChartItems,
} from "../lib/mockChartData";
import { Button2 } from "../ui/Shared";
import { ArrowRight } from "phosphor-react";

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
  // State for chart data
  const [chartItems, setChartItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  // Load mock data on mount
  useEffect(() => {
    // Simulate API request
    const timer = setTimeout(() => {
      setChartItems(generateMockChartData());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter and sort items based on search query and sort config
  const filteredAndSortedItems = useMemo(() => {
    const filtered = filterChartItems(chartItems, searchQuery);
    return sortChartItems(filtered, sortConfig.sortBy, sortConfig.direction);
  }, [chartItems, searchQuery, sortConfig]);

  // Handlers for chart operations
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteModalItem) return;

    setChartItems((prev) =>
      prev.filter((item) => item.id !== deleteModalItem.id)
    );
    setDeleteModalItem(null);
  }, [deleteModalItem]);

  const handleCloneConfirm = useCallback(
    (newName: string) => {
      if (!cloneModalItem || cloneModalItem.type !== "chart") return;

      const newChart: ChartItem = {
        ...cloneModalItem,
        id: `cloned-${Date.now()}`,
        name: newName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setChartItems((prev) => [...prev, newChart]);
      setCloneModalItem(null);
    },
    [cloneModalItem]
  );

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (!renameModalItem) return;

      setChartItems((prev) =>
        prev.map((item) =>
          item.id === renameModalItem.id
            ? { ...item, name: newName, updatedAt: new Date() }
            : item
        )
      );
      setRenameModalItem(null);
    },
    [renameModalItem]
  );

  const handleNewFolderConfirm = useCallback((name: string) => {
    const newFolder: ChartItem = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "folder",
      items: [],
    };

    setChartItems((prev) => [...prev, newFolder]);
    setIsNewFolderModalOpen(false);
  }, []);

  const handleOpenChart = useCallback(
    (item: ChartItem) => {
      if (item.type === "chart") {
        // Replace with actual navigation logic
        navigate(`/chart/${item.id}`);
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

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
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

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onConfirm={handleNewFolderConfirm}
      />
    </div>
  );
}
