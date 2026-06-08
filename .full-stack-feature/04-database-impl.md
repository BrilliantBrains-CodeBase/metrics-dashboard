# Data Layer Implementation

## Files Created

### `types/shopify-analytics.ts` (new)
8 TypeScript interfaces: `SalesBreakdown`, `ProductSalesRow`, `FunnelStep`, `ConversionFunnel`, `LocationRow`, `ReferrerRow`, `LandingPageRow`, `HourlyOrdersRow`, `ShopifyAnalyticsData`.

### `lib/shopify-analytics-parser.ts` (new)
- `parseShopifyAnalyticsSheet(raw: string[][]): ShopifyAnalyticsData` — top-level parser using `[SECTION]` sentinel rows
- 7 sub-parsers (salesBreakdown, salesByProduct, conversionFunnel, sessionsByLocation, sessionsByReferrer, sessionsByLandingPage, ordersByHour)
- `generateMockShopifyAnalytics(brandName: string): ShopifyAnalyticsData` — deterministic mock data using brand-name seed, matches real Shopify export shape

## Files Modified

### `types/index.ts`
- Added `import { ShopifyAnalyticsData } from '@/types/shopify-analytics'` + re-export
- Extended `DataSource` to `'shopify' | 'meta' | 'google-ads' | 'meta-ads' | 'interakt'`
- Added `NavState` interface: `{ vertical, brandId, dataSource }`
- Added `shopifyAnalyticsSheetName?: string` to `Brand`
- Added `shopifyAnalytics?: ShopifyAnalyticsData` to `BrandData`

### `lib/sheets.ts`
- Added import of `ShopifyAnalyticsData`, `parseShopifyAnalyticsSheet`, `generateMockShopifyAnalytics`
- Added `fetchShopifyAnalytics(brand: Brand): Promise<ShopifyAnalyticsData>` — fetches "Shopify Analytics" tab, falls back to mock data on error; existing exports unchanged

### `config/brands.ts`
- Added `shopifyAnalyticsSheetName: 'Shopify Analytics'` to all 7 ecommerce brands

## Notes
- All existing exports in `lib/sheets.ts` and `lib/metrics.ts` are unchanged
- The parser uses `normalizeKey` + column-index lookup matching existing patterns
- Mock data is brand-name-seeded (deterministic, no randomness per session) so the UI shows consistent values
