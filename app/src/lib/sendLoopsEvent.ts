export function sendLoopsEvent(body: { email: string; eventName: string }) {
  if (process.env.REACT_APP_VERCEL_ENV !== "production") return;

  fetch("/api/loops-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
