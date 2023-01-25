export function track(
  event: string,
  action: string,
  obj?: Record<string, unknown>
) {
  if (window?.dataLayer)
    window.dataLayer.push({
      event,
      action,
      ...obj,
    });
}
