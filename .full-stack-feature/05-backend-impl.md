# Backend Implementation

No new backend routes were added — per architecture decision, all data continues to flow through the existing `/api/sheets` Google Sheets proxy route.

The "backend" work for this feature is entirely in the data-access layer (`lib/sheets.ts` + `lib/shopify-analytics-parser.ts`) documented in `04-database-impl.md`.

## Existing Routes (unchanged)
- `app/api/sheets/route.ts` — Google Sheets proxy; used by `fetchShopifyAnalytics` with `?id=<spreadsheetId>&sheet=Shopify+Analytics`
- `app/api/csv/route.ts` — unchanged
- `app/api/config-check/route.ts` — unchanged
