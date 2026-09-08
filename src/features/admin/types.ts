/**
 * Shapes shared between the admin's server queries and its client components.
 *
 * They live here rather than in `server/admin-queries.ts` so a chart can import
 * its own prop type without reaching into a `server-only` module.
 */

/** One day of the dashboard trend series. `date` is `YYYY-MM-DD`. */
export type TrendPoint = {
  date: string;
  revenuePaise: number;
  orders: number;
};
