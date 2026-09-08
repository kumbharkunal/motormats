const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const INR_WITH_PAISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPaise(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new TypeError(`Expected integer paise, received ${paise}`);
  }
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? INR.format(rupees) : INR_WITH_PAISE.format(rupees);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
