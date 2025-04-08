import { Tables } from "../../types/database.types";

export interface FlowchartItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "chart";
  content?: string;
  is_public: boolean;
  public_id: string | null;
  folder_id: string | null;
  user_id: string;
}

// Convert from Supabase user_charts table to our FlowchartItem
export function mapToFlowchartItem(
  chart: Tables<"user_charts">
): FlowchartItem {
  return {
    id: chart.id.toString(),
    name: chart.name,
    createdAt: new Date(chart.created_at),
    updatedAt: new Date(chart.updated_at),
    type: "chart",
    content: chart.chart,
    is_public: chart.is_public,
    public_id: chart.public_id,
    folder_id: chart.folder_id,
    user_id: chart.user_id,
  };
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "folder";
  items: (FlowchartItem | FolderItem)[];
  parent_id: string | null;
  user_id: string;
}

// Convert from Supabase folders table to our FolderItem
export function mapToFolderItem(
  folder: Tables<"folders">,
  items: (FlowchartItem | FolderItem)[] = []
): FolderItem {
  return {
    id: folder.id,
    name: folder.name,
    createdAt: new Date(folder.created_at || Date.now()),
    updatedAt: new Date(folder.updated_at || Date.now()),
    type: "folder",
    items,
    parent_id: folder.parent_id,
    user_id: folder.user_id,
  };
}

export type ChartItem = FlowchartItem | FolderItem;

export type SortOption = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  sortBy: SortOption;
  direction: SortDirection;
}
