export function formatDate(date: string) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
}
