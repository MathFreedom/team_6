export function monthlySavingsFromAnnual(annualSavingsEur: number) {
  return Math.round((annualSavingsEur / 12) * 100) / 100;
}

