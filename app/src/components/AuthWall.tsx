import { ReactNode, Suspense, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import Spinner from "./Spinner";

/**
 * This component redirects to the login page if the user is not logged in.
 */
export function AuthWall({ children }: { children: ReactNode }) {
  const { checkedSession, session } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkedSession) return;
    if (!session) {
      // create params for login page
      const params = new URLSearchParams();
      // show auth wall at top of page
      params.set("showAuthWallWarning", "true");

      // full redirect including hash and search params
      params.set("redirectUrl", window.location.href);

      // go to login page with params
      const fullPath = `/l?${params.toString()}`;

      // replace the state so back button doesn't infinite loop
      navigate(fullPath, {
        replace: true,
      });
    } else {
      setIsLoading(false);
    }
  }, [checkedSession, navigate, session]);

  return (
    <Suspense fallback={<Loading />}>
      {isLoading ? <Loading /> : children}
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="h-full grid content-center justify-center">
      <Spinner className="text-blue-500" />
    </div>
  );
}
