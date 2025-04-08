import { PostgrestError } from "@supabase/supabase-js";
import { useQuery, useMutation } from "react-query";
import { queryClient } from "./queries";
import { supabase } from "./supabaseClient";
import { Tables } from "../types/database.types";
import {
  FlowchartItem,
  FolderItem,
  ChartItem,
  mapToFlowchartItem,
  mapToFolderItem,
} from "../components/charts/types";

/**
 * Fetch items (charts and folders) at a specific folder level
 * If parentId is null, fetch root-level items
 */
async function fetchItemsByParentId(
  parentId: string | null = null
): Promise<ChartItem[]> {
  if (!supabase) throw new Error("No supabase client");

  // Fetch folders
  const { data: folders, error: foldersError } = await supabase
    .from("folders")
    .select("*")
    .eq("parent_id", parentId);

  if (foldersError) throw foldersError;

  // Fetch charts
  const { data: charts, error: chartsError } = await supabase
    .from("user_charts")
    .select("*")
    .eq("folder_id", parentId);

  if (chartsError) throw chartsError;

  // Transform data to our frontend format
  const transformedFolders = folders.map((folder) => mapToFolderItem(folder));
  const transformedCharts = charts.map((chart) => mapToFlowchartItem(chart));

  // Combine charts and folders
  return [...transformedFolders, ...transformedCharts];
}

/**
 * React Query hook to fetch items in a folder
 */
export function useItemsByParentId(parentId: string | null = null) {
  return useQuery(
    ["items", "byParentId", parentId],
    () => fetchItemsByParentId(parentId),
    {
      staleTime: 0,
      refetchOnMount: true,
    }
  );
}

/**
 * Create a new folder
 */
async function createFolder(params: {
  name: string;
  parent_id: string | null;
  user_id: string;
}): Promise<FolderItem> {
  if (!supabase) throw new Error("No supabase client");

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: params.name,
      parent_id: params.parent_id,
      user_id: params.user_id,
    })
    .select()
    .single();

  if (error) throw error;

  return mapToFolderItem(data);
}

/**
 * React Query mutation for creating folders
 */
export function useCreateFolder() {
  return useMutation(createFolder, {
    onSuccess: (result, variables) => {
      // Invalidate queries for the parent folder
      queryClient.invalidateQueries([
        "items",
        "byParentId",
        variables.parent_id,
      ]);
    },
  });
}

/**
 * Rename a folder
 */
async function renameFolder(params: {
  id: string;
  name: string;
}): Promise<FolderItem> {
  if (!supabase) throw new Error("No supabase client");

  const { data, error } = await supabase
    .from("folders")
    .update({ name: params.name })
    .eq("id", params.id)
    .select()
    .single();

  if (error) throw error;

  return mapToFolderItem(data);
}

/**
 * React Query mutation for renaming folders
 */
export function useRenameFolder() {
  return useMutation(renameFolder, {
    onSuccess: () => {
      // Invalidate queries that might include this folder
      queryClient.invalidateQueries(["items", "byParentId"]);
    },
  });
}

/**
 * Rename a chart
 */
async function renameChart(params: {
  id: string;
  name: string;
}): Promise<FlowchartItem> {
  if (!supabase) throw new Error("No supabase client");

  const { data, error } = await supabase
    .from("user_charts")
    .update({ name: params.name })
    .eq("id", parseInt(params.id, 10))
    .select()
    .single();

  if (error) throw error;

  // Also invalidate the chart's own query if it exists
  queryClient.invalidateQueries(["useHostedDoc", params.id]);

  return mapToFlowchartItem(data);
}

/**
 * React Query mutation for renaming charts
 */
export function useRenameChart() {
  return useMutation(renameChart, {
    onSuccess: () => {
      // Invalidate queries that might include this chart
      queryClient.invalidateQueries(["items", "byParentId"]);
    },
  });
}

/**
 * Delete a folder
 */
async function deleteFolder(params: { id: string }): Promise<string | null> {
  if (!supabase) throw new Error("No supabase client");

  // First get the folder to find its parent_id for cache invalidation
  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("parent_id")
    .eq("id", params.id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the folder
  const { error } = await supabase.from("folders").delete().eq("id", params.id);

  if (error) throw error;

  // Return the parent_id for cache invalidation
  return folder.parent_id;
}

/**
 * React Query mutation for deleting folders
 */
export function useDeleteFolder() {
  return useMutation(deleteFolder, {
    onSuccess: (parentId) => {
      // Invalidate the parent folder's queries
      queryClient.invalidateQueries(["items", "byParentId", parentId]);
      // Also invalidate the folder itself in case it was open
      queryClient.invalidateQueries(["items", "byParentId"]);
    },
  });
}

/**
 * Delete a chart
 */
async function deleteChart(params: {
  id: string;
}): Promise<{ folder_id: string | null }> {
  if (!supabase) throw new Error("No supabase client");

  // First get the chart to find its folder_id for cache invalidation
  const { data: chart, error: fetchError } = await supabase
    .from("user_charts")
    .select("folder_id")
    .eq("id", parseInt(params.id, 10))
    .single();

  if (fetchError) throw fetchError;

  // Delete the chart
  const { error } = await supabase
    .from("user_charts")
    .delete()
    .eq("id", parseInt(params.id, 10));

  if (error) throw error;

  // Return the folder_id for cache invalidation
  return { folder_id: chart.folder_id };
}

/**
 * React Query mutation for deleting charts
 */
export function useDeleteChart() {
  return useMutation(deleteChart, {
    onSuccess: (result, variables) => {
      // Invalidate the parent folder's queries
      queryClient.invalidateQueries(["items", "byParentId", result.folder_id]);

      // Also invalidate the chart's own query if it exists
      queryClient.invalidateQueries(["useHostedDoc", variables.id]);

      // Remove the chart from the cache
      queryClient.removeQueries(["useHostedDoc", variables.id]);
    },
  });
}

/**
 * Move a folder to a new parent
 */
async function moveFolder(params: {
  id: string;
  newParentId: string | null;
}): Promise<{ oldParentId: string | null; newParentId: string | null }> {
  if (!supabase) throw new Error("No supabase client");

  // First get the folder to find its current parent_id
  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("parent_id")
    .eq("id", params.id)
    .single();

  if (fetchError) throw fetchError;

  const oldParentId = folder.parent_id;

  // Update the folder
  const { error } = await supabase
    .from("folders")
    .update({ parent_id: params.newParentId })
    .eq("id", params.id);

  if (error) throw error;

  return { oldParentId, newParentId: params.newParentId };
}

/**
 * React Query mutation for moving folders
 */
export function useMoveFolder() {
  return useMutation(moveFolder, {
    onSuccess: (result) => {
      // Invalidate queries for both the old and new parent folders
      queryClient.invalidateQueries([
        "items",
        "byParentId",
        result.oldParentId,
      ]);
      queryClient.invalidateQueries([
        "items",
        "byParentId",
        result.newParentId,
      ]);
    },
  });
}

/**
 * Move a chart to a new folder
 */
async function moveChart(params: {
  id: string;
  newFolderId: string | null;
}): Promise<{ oldFolderId: string | null; newFolderId: string | null }> {
  if (!supabase) throw new Error("No supabase client");

  // First get the chart to find its current folder_id
  const { data: chart, error: fetchError } = await supabase
    .from("user_charts")
    .select("folder_id")
    .eq("id", parseInt(params.id, 10))
    .single();

  if (fetchError) throw fetchError;

  const oldFolderId = chart.folder_id;

  // Update the chart
  const { error } = await supabase
    .from("user_charts")
    .update({ folder_id: params.newFolderId })
    .eq("id", parseInt(params.id, 10));

  if (error) throw error;

  return { oldFolderId, newFolderId: params.newFolderId };
}

/**
 * React Query mutation for moving charts
 */
export function useMoveChart() {
  return useMutation(moveChart, {
    onSuccess: (result) => {
      // Invalidate queries for both the old and new parent folders
      queryClient.invalidateQueries([
        "items",
        "byParentId",
        result.oldFolderId,
      ]);
      queryClient.invalidateQueries([
        "items",
        "byParentId",
        result.newFolderId,
      ]);
    },
  });
}

/**
 * Clone/copy a chart
 */
async function cloneChart(params: {
  id: string;
  newName: string;
  userId: string;
}): Promise<FlowchartItem> {
  if (!supabase) throw new Error("No supabase client");

  // Get the source chart
  const { data: sourceChart, error: fetchError } = await supabase
    .from("user_charts")
    .select("*")
    .eq("id", parseInt(params.id, 10))
    .single();

  if (fetchError) throw fetchError;

  // Create the new chart
  const { data, error } = await supabase
    .from("user_charts")
    .insert({
      name: params.newName,
      chart: sourceChart.chart,
      folder_id: sourceChart.folder_id,
      user_id: params.userId,
      is_public: false, // Default to private for cloned charts
    })
    .select()
    .single();

  if (error) throw error;

  return mapToFlowchartItem(data);
}

/**
 * React Query mutation for cloning charts
 */
export function useCloneChart() {
  return useMutation(cloneChart, {
    onSuccess: (result) => {
      // Invalidate queries for the parent folder
      queryClient.invalidateQueries(["items", "byParentId", result.folder_id]);
    },
  });
}

/**
 * Toggle public status of a chart
 */
async function toggleChartPublic(params: {
  id: string;
  isPublic: boolean;
}): Promise<{ isPublic: boolean; publicId: string | null }> {
  if (!supabase) throw new Error("No supabase client");

  const { data, error } = await supabase
    .from("user_charts")
    .select("is_public,public_id")
    .eq("id", parseInt(params.id, 10));

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid Chart");

  const { is_public, public_id } = data[0];
  if (is_public === params.isPublic)
    return { isPublic: is_public, publicId: public_id };

  const r = {
    isPublic: params.isPublic,
    publicId: public_id,
  };

  // Generate public id if not already set
  if (!public_id && params.isPublic) {
    let error: PostgrestError | null = {
      code: "23505",
      message: "Duplicate key value violates unique constraint",
      details: "",
      hint: "",
      name: "PostgrestError",
    };
    // If unique violation, generate a new public id
    let result;
    let publicId = "";
    while (error?.code === "23505") {
      publicId = await generatePublicId();
      result = await supabase
        .from("user_charts")
        .update({ public_id: publicId, is_public: params.isPublic })
        .eq("id", parseInt(params.id, 10));
      error = result.error;
    }
    if (error) throw error;
    r.publicId = publicId;
  } else {
    // Just update is_public
    const result = await supabase
      .from("user_charts")
      .update({ is_public: params.isPublic })
      .eq("id", parseInt(params.id, 10));
    if (result.error) throw result.error;
  }

  return r;
}

/**
 * Generate a public ID for sharing
 */
async function generatePublicId(): Promise<string> {
  const response = await fetch("/api/generate-public-id", {
    mode: "cors",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

/**
 * React Query mutation for toggling chart public status
 */
export function useToggleChartPublic() {
  return useMutation(toggleChartPublic);
}

/**
 * Get breadcrumb path for a folder
 */
async function getFolderPath(folderId: string): Promise<FolderItem[]> {
  if (!supabase) throw new Error("No supabase client");
  if (!folderId) return [];

  const path: FolderItem[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", currentId)
      .single();

    if (error) throw error;
    if (!data) break;

    const folder = data as Tables<"folders">;
    path.unshift(mapToFolderItem(folder));
    currentId = folder.parent_id;
  }

  return path;
}

/**
 * React Query hook for getting a folder's breadcrumb path
 */
export function useFolderPath(folderId: string | null) {
  return useQuery(
    ["folder", "path", folderId],
    () => (folderId ? getFolderPath(folderId) : []),
    {
      enabled: !!folderId,
    }
  );
}
