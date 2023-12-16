// keep a simple cache that prevents the same loops event from being sent twice
// in the same session
const sentEvents = new Set<string>();

export function sendLoopsEvent(body: { email: string; eventName: string }) {
  if (process.env.REACT_APP_VERCEL_ENV !== "production") {
    console.log("Not sending loops event in dev mode");
    return;
  }

  const key = `${body.email}:${body.eventName}`;
  if (sentEvents.has(key)) {
    console.log(
      `Loops event: ${body.eventName} for ${body.email} already sent`
    );
    return;
  }
  sentEvents.add(key);

  console.log(`Loops event: ${body.eventName} for ${body.email} sent`);

  fetch("/api/loops-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (!res.ok) {
        console.error("Failed to send loops event", res);
      } else {
        console.log("Sent loops event", body);
      }
    })
    .catch((err) => {
      console.error("Failed to send loops event", err);
    });
}

export function loopsNewSubscriber(email: string) {
  sendLoopsEvent({
    email,
    eventName: "new_subscriber",
  });
}
