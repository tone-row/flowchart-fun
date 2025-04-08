/**
 * Formats a date into a readable format
 * If the date is today, returns "Today at HH:MM AM/PM"
 * If the date is yesterday, returns "Yesterday at HH:MM AM/PM"
 * Otherwise returns "MMM DD, YYYY at HH:MM AM/PM"
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Format time
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

  // Check if today
  if (date >= today) {
    return `Today at ${timeStr}`;
  }

  // Check if yesterday
  if (date >= yesterday) {
    return `Yesterday at ${timeStr}`;
  }

  // Otherwise, full date
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year} at ${timeStr}`;
}
