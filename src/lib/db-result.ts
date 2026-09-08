import 'server-only';

// Drizzle/mysql2 returns [ResultSetHeader, ...]; affectedRows lives at result[0].
export function affectedRows(result: unknown): number {
  if (Array.isArray(result)) {
    const header: unknown = result[0];
    if (header && typeof header === 'object' && 'affectedRows' in header) {
      const value = (header as { affectedRows: unknown }).affectedRows;
      return typeof value === 'number' ? value : 0;
    }
    return 0;
  }

  if (result && typeof result === 'object' && 'affectedRows' in result) {
    const value = (result as { affectedRows: unknown }).affectedRows;
    return typeof value === 'number' ? value : 0;
  }

  return 0;
}
