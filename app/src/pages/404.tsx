import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";

export default function Page404() {
  return (
    <div className="grid gap-4 justify-content-center justify-items-center content-center">
      <h1 className="text-5xl font-bold -mb-2">404</h1>
      <p className="text-xl">
        <Trans>Page not found</Trans>
      </p>
      <Link to="/" className="text-blue-500 hover:underline">
        <Trans>Go back home</Trans>
      </Link>
    </div>
  );
}
