export function sample(data: {
  template: string;
  subject: string;
  runningTime: number;
  result: string;
}) {
  const token = process.env.REACT_APP_TINYBIRD_TOKEN;
  if (!token) return;
  fetch("https://api.us-east.tinybird.co/v0/events?name=events_example", {
    method: "POST",
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
