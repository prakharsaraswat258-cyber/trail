export interface StatsSummary {
  itemsReturnedThisWeek: number;
  activeReports: number;
  avgTimeToMatchHours: number;
}

// TODO: replace mock with live API
export async function fetchStatsSummary(): Promise<StatsSummary> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    itemsReturnedThisWeek: 42,
    activeReports: 128,
    avgTimeToMatchHours: 4.2,
  };
}
