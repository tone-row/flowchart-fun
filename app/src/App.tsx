import { Box, Type } from "@tone-row/slang";
import Router from "./components/Router";
import * as Sentry from "@sentry/react";

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Router />
    </Sentry.ErrorBoundary>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="errorWrapper">
      <Box role="alert" className="error-wrapper">
        <Type>Sorry! Something went wrong. 😔</Type>
        <div className="errorMessage">
          <pre>{error.message}</pre>
        </div>
        <button onClick={() => window.location.reload()}>Try again</button>
      </Box>
    </div>
  );
}
