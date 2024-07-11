import { useQuery } from "react-query";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useVersionCheck = create(
  devtools(
    () => ({
      version: "",
      showModal: false,
    }),
    {
      name: "Version Check",
    }
  )
);

async function checkVersion() {
  // get current version from store
  const version = useVersionCheck.getState().version;
  const result = await fetch("/api/version").then((res) => res.json());

  // if there is no version at all, set it
  if (!version) {
    useVersionCheck.setState(
      { version: result.version },
      false,
      "checkVersion"
    );
    // else if there is a version and it doesn't match the current version, update it
  } else if (version !== result.version) {
    useVersionCheck.setState(
      { version: result.version, showModal: true },
      false,
      "checkVersion"
    );
    // we're also going to fetch the changelog for this version and display it in the modal
  }
  return version;
}

/** Polls for version updates */
export async function useCheckVersion() {
  return useQuery("version", checkVersion, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchIntervalInBackground: true,
  });
}
