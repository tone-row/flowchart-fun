const priceId = process.env.STRIPE_PRICE_ID;
const priceIdYearly = process.env.STRIPE_PRICE_ID_YEARLY;
const legacyPriceId = process.env.LEGACY_STRIPE_PRICE_ID;
const legacyPriceIdYearly = process.env.LEGACY_STRIPE_PRICE_ID_YEARLY;
const otherValidPriceIdsString = process.env.OTHER_VALID_STRIPE_PRICE_IDS;
const otherValidPriceIds = otherValidPriceIdsString
  ? otherValidPriceIdsString.split(",")
  : [];
export const validStripePrices = [
  priceId,
  priceIdYearly,
  legacyPriceId,
  legacyPriceIdYearly,
  ...otherValidPriceIds,
].filter(Boolean) as string[];
