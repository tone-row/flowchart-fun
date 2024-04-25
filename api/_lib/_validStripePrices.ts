const priceId = process.env.STRIPE_PRICE_ID;
const priceIdYearly = process.env.STRIPE_PRICE_ID_YEARLY;
const otherValidPriceIdsString = process.env.OTHER_VALID_STRIPE_PRICE_IDS;
const otherValidPriceIds = otherValidPriceIdsString
  ? otherValidPriceIdsString.split(",")
  : [];
export const validStripePrices = [
  priceId,
  priceIdYearly,
  ...otherValidPriceIds,
].filter(Boolean) as string[];
