/** Shared contracts belong here only when both applications genuinely need them. */
export const CURRENCY_KES = 'KES' as const;
export type CurrencyCode = typeof CURRENCY_KES;
