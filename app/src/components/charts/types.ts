export interface FlowchartItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "chart";
  content?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "folder";
  items: (FlowchartItem | FolderItem)[];
}

export type ChartItem = FlowchartItem | FolderItem;

export type SortOption = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  sortBy: SortOption;
  direction: SortDirection;
}
