export function isoToCronLike(isoDate: string): string {
  const date = new Date(isoDate);

  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // JS months are 0-based
  const seconds = date.getUTCSeconds();

  return `${seconds} ${minute} ${hour} ${day} ${month} *`;
}

export function isoToUnix(isoDateString: string): number {
  return Math.floor(new Date(isoDateString).getTime() / 1000);
}
