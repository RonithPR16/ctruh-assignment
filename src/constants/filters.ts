export type PriceRange = {
  value: string;
  min: number;
  max: number;
};

export const PRICE_RANGES: PriceRange[] = [
  { value: "0-250", min: 0, max: 250 },
  { value: "251-450", min: 251, max: 450 },
  { value: "450+", min: 451, max: Infinity },
];
