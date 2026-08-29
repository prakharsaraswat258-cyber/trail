import { createClient } from '../supabase/client';

export interface StatsSummary {
  itemsReturnedThisWeek: number;
  activeReports: number;
  avgTimeToMatchHours: number;
}

export async function fetchStatsSummary(): Promise<StatsSummary> {
  const supabase = createClient();

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Count items returned this week
    const { count: returnedCount, error: returnedError } = await supabase
      .from('found_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'returned')
      .gte('returned_at', sevenDaysAgo);

    if (returnedError) throw returnedError;

    // 2. Count active found items
    const { count: activeFoundCount, error: activeFoundError } = await supabase
      .from('found_items')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'returned');

    if (activeFoundError) throw activeFoundError;

    // 3. Count active lost reports
    const { count: activeLostCount, error: activeLostError } = await supabase
      .from('lost_reports')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'resolved');

    if (activeLostError) throw activeLostError;

    const itemsReturnedThisWeek = returnedCount || 0;
    const activeReports = (activeFoundCount || 0) + (activeLostCount || 0);

    // TODO: Calculate real avgTimeToMatchHours once sufficient confirmed matches exist
    const avgTimeToMatchHours = 0;

    return {
      itemsReturnedThisWeek,
      activeReports,
      avgTimeToMatchHours,
    };
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch statistics summary');
  }
}
