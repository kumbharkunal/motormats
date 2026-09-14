/** Build selectable years from model copy like "2020–present" or "2016–present". */
export function yearsForModel(yearRange: string | undefined, maxYears = 12): number[] {
  const currentYear = new Date().getFullYear();
  if (!yearRange?.trim()) {
    return [currentYear, currentYear - 1, currentYear - 2];
  }

  const startMatch = yearRange.match(/(\d{4})/);
  const start = startMatch ? Number.parseInt(startMatch[1]!, 10) : currentYear - 5;
  const endsPresent = /present/i.test(yearRange);
  const endMatch = yearRange.match(/(\d{4})\s*[–-]\s*(\d{4})/);
  const end = endsPresent
    ? currentYear
    : endMatch
      ? Number.parseInt(endMatch[2]!, 10)
      : currentYear;

  const from = Math.min(start, end);
  const to = Math.max(start, end);
  const years: number[] = [];
  for (let y = to; y >= from && years.length < maxYears; y -= 1) {
    years.push(y);
  }
  return years.length > 0 ? years : [currentYear];
}
