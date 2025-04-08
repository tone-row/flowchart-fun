import {
  ChartItem,
  FlowchartItem,
  FolderItem,
} from "../components/charts/types";

// Generate a random date between a start and end date
const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Generate a random string of a given length
const randomString = (length: number): string => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate a random flowchart
const generateFlowchart = (id?: string): FlowchartItem => {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const created = randomDate(sixMonthsAgo, now);
  const updated = randomDate(created, now);

  return {
    id: id || randomString(10),
    name: `Flowchart ${Math.floor(Math.random() * 100)}`,
    createdAt: created,
    updatedAt: updated,
    type: "chart",
    content: `This is a sample flowchart content`,
  };
};

// Generate a folder with random flowcharts
const generateFolder = (depth = 0, id?: string): FolderItem => {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const created = randomDate(sixMonthsAgo, now);
  const updated = randomDate(created, now);

  const numItems = Math.floor(Math.random() * 5) + 1;
  const items: ChartItem[] = [];

  for (let i = 0; i < numItems; i++) {
    if (depth < 2 && Math.random() > 0.7) {
      // Add a subfolder
      items.push(generateFolder(depth + 1));
    } else {
      // Add a flowchart
      items.push(generateFlowchart());
    }
  }

  return {
    id: id || randomString(10),
    name: `Folder ${Math.floor(Math.random() * 100)}`,
    createdAt: created,
    updatedAt: updated,
    type: "folder",
    items,
  };
};

// Generate a list of random charts and folders
export const generateMockChartData = (count = 15): ChartItem[] => {
  const items: ChartItem[] = [];

  for (let i = 0; i < count; i++) {
    if (Math.random() > 0.7) {
      // Add a folder
      items.push(generateFolder());
    } else {
      // Add a flowchart
      items.push(generateFlowchart());
    }
  }

  return items;
};

// Sort chart items based on sort config
export const sortChartItems = (
  items: ChartItem[],
  sortBy: string,
  direction: "asc" | "desc"
): ChartItem[] => {
  const sorted = [...items].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "createdAt") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    } else {
      // updatedAt
      return a.updatedAt.getTime() - b.updatedAt.getTime();
    }
  });

  // Folders are always listed before charts
  const folders = sorted.filter((item) => item.type === "folder");
  const charts = sorted.filter((item) => item.type === "chart");

  if (direction === "desc") {
    return [...folders.reverse(), ...charts.reverse()];
  }

  return [...folders, ...charts];
};

// Filter chart items based on search query
export const filterChartItems = (
  items: ChartItem[],
  query: string
): ChartItem[] => {
  if (!query.trim()) return items;

  const searchTerm = query.toLowerCase();

  return items.filter((item) => {
    // Check item name
    if (item.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // For folders, recursively check children
    if (item.type === "folder") {
      const filteredItems = filterChartItems((item as FolderItem).items, query);

      if (filteredItems.length > 0) {
        // Create a new folder with just the matching items
        return {
          ...item,
          items: filteredItems,
        };
      }
    }

    return false;
  });
};
