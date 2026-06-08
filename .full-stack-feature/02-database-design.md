# Data Models: Dashboard Redesign with Shopify Analytics

## 1. Existing `ShopifyRow` (Reference — `types/index.ts`)

This is the existing time-series row type. Do not modify it.

```typescript
// types/index.ts — already exists, shown here as authoritative reference
export interface ShopifyRow {
  date: string         // ISO "YYYY-MM-DD"
  totalSales: number   // Total Sales (net + shipping + taxes)
  grossSales: number   // Gross Sales before discounts/returns
  discounts: number    // Always stored as positive number (absolute value of discount)
  returns: number      // Always stored as positive number (absolute value of refund)
  netSales: number     // grossSales - discounts - returns
  orders: number       // Count of completed orders
  aov: number          // Average Order Value (totalSales / orders, or from sheet)
}
```

**Sheet columns (tab: `Shopify`):**
```
Date | Gross Sales | Discounts | Returns | Net Sales | Total Sales | Orders | AOV
```

---

## 2. Existing Navigation & Config Types (Reference — already in `types/index.ts`)

```typescript
export type Vertical   = 'ecommerce' | 'hospital' | 'other'
export type DataSource = 'shopify' | 'meta'      // will be extended (see §3)
export type DateRange  = 'yesterday' | '7d' | '30d' | '90d' | 'all'
```

---

## 3. New Types to Add

### 3a. Extended `DataSource`

```typescript
// types/index.ts — replace existing DataSource
export type DataSource =
  | 'shopify'
  | 'google-ads'
  | 'meta-ads'
  | 'interakt'
```

### 3b. Navigation State

```typescript
// types/index.ts — add
export interface NavState {
  vertical:   Vertical
  brandId:    string      // matches Brand.id from config/brands.ts
  dataSource: DataSource
}
```

### 3c. `ShopifyAnalyticsData`

This is a **snapshot** — not time-series. It is fetched once for the selected date range and represents aggregated analytics from the "Shopify Analytics" sheet tab.

```typescript
// types/shopify-analytics.ts (new file)

// ── Sales Breakdown card ─────────────────────────────────────────────────────
export interface SalesBreakdown {
  grossSales: number
  discounts:  number
  returns:    number
  netSales:   number
  shipping:   number
  taxes:      number
  totalSales: number
}

// ── Sales by Product horizontal bar chart ────────────────────────────────────
export interface ProductSalesRow {
  productName: string
  variant:     string
  collection:  string
  revenue:     number
  units:       number
}

// ── Conversion Funnel card ───────────────────────────────────────────────────
export interface FunnelStep {
  count: number
  rate:  number   // 0–1 decimal fraction of sessions
}

export interface ConversionFunnel {
  sessions:           FunnelStep
  addedToCart:        FunnelStep
  reachedCheckout:    FunnelStep
  completedCheckout:  FunnelStep
}

// ── Sessions by Location table ───────────────────────────────────────────────
export interface LocationRow {
  country:  string
  state:    string
  city:     string
  sessions: number
}

// ── Sessions by Social Referrer table ────────────────────────────────────────
export interface ReferrerRow {
  source:   string
  sessions: number
}

// ── Sessions by Landing Page table ──────────────────────────────────────────
export interface LandingPageRow {
  pageType: string
  url:      string
  sessions: number
}

// ── Orders by Time of Day chart ──────────────────────────────────────────────
export interface HourlyOrdersRow {
  hour:   number   // 0–23
  orders: number
}

// ── Top-level snapshot type ──────────────────────────────────────────────────
export interface ShopifyAnalyticsData {
  dateFrom:              string
  dateTo:                string
  salesBreakdown:        SalesBreakdown
  salesByProduct:        ProductSalesRow[]
  conversionFunnel:      ConversionFunnel
  sessionsByLocation:    LocationRow[]
  sessionsByReferrer:    ReferrerRow[]
  sessionsByLandingPage: LandingPageRow[]
  ordersByHour:          HourlyOrdersRow[]
}
```

### 3d. Extended `Brand` Config Type

```typescript
// types/index.ts — add optional field to existing Brand interface
export interface Brand {
  id:                         string
  name:                       string
  vertical:                   Vertical
  spreadsheetId:              string
  sheetName?:                 string
  shopifySpreadsheetId?:      string
  shopifySheetName?:          string
  /** Tab name for ShopifyAnalyticsData snapshot; defaults to "Shopify Analytics" */
  shopifyAnalyticsSheetName?: string
}
```

### 3e. Extended `BrandData`

```typescript
// types/index.ts — add optional field to existing BrandData interface
export interface BrandData {
  brand:            Brand
  rows:             AnyRow[]
  shopifyRows:      ShopifyRow[]
  shopifyAnalytics?: ShopifyAnalyticsData   // null = not yet loaded / tab missing
  error?:           string
}
```

---

## 4. Google Sheets Tab Layout: "Shopify Analytics"

### Design Principle

Uses **section-header sentinel rows** to delimit blocks. A sentinel row has its first cell matching a known constant and all remaining cells empty.

### Tab Name

`Shopify Analytics` (configurable via `Brand.shopifyAnalyticsSheetName`)

### Full Layout Spec

```
Row  A                              B            C           D          E        F       G
──────────────────────────────────────────────────────────────────────────────────────────
1    [META] Date From               2025-01-01
2    [META] Date To                 2025-01-31
3    (blank)
4    [SECTION] Sales Breakdown
5    Gross Sales    Discounts    Returns    Net Sales    Shipping    Taxes    Total Sales
6    <value>        <value>      <value>    <value>      <value>     <value>  <value>
7    (blank)
8    [SECTION] Sales By Product
9    Product Name   Variant      Collection  Revenue    Units
10   <value>        <value>      <value>     <value>    <value>
11   ...more product rows...
12   (blank)
13   [SECTION] Conversion Funnel
14   Stage          Count        Rate
15   Sessions       <count>      1
16   Added To Cart  <count>      <rate 0–1>
17   Reached Checkout <count>    <rate 0–1>
18   Completed Checkout <count>  <rate 0–1>
19   (blank)
20   [SECTION] Sessions By Location
21   Country        State        City        Sessions
22   <value>        <value>      <value>     <value>
23   ...more location rows...
24   (blank)
25   [SECTION] Sessions By Referrer
26   Source         Sessions
27   <value>        <value>
28   ...more referrer rows...
29   (blank)
30   [SECTION] Sessions By Landing Page
31   Page Type      URL          Sessions
32   <value>        <value>      <value>
33   ...more landing page rows...
34   (blank)
35   [SECTION] Orders By Hour
36   Hour           Orders
37   0              <value>
38   1              <value>
39   ...up to hour 23...
```

### Sentinel Constants

```typescript
const SECTION = {
  SALES_BREAKDOWN:      '[SECTION] Sales Breakdown',
  SALES_BY_PRODUCT:     '[SECTION] Sales By Product',
  CONVERSION_FUNNEL:    '[SECTION] Conversion Funnel',
  SESSIONS_BY_LOCATION: '[SECTION] Sessions By Location',
  SESSIONS_BY_REFERRER: '[SECTION] Sessions By Referrer',
  SESSIONS_BY_LANDING:  '[SECTION] Sessions By Landing Page',
  ORDERS_BY_HOUR:       '[SECTION] Orders By Hour',
} as const

const META = {
  DATE_FROM: '[META] Date From',
  DATE_TO:   '[META] Date To',
} as const
```

---

## 5. Parser Function Signatures

```typescript
// lib/shopify-analytics-parser.ts

export function parseShopifyAnalyticsSheet(raw: string[][]): ShopifyAnalyticsData

function findSectionStart(raw: string[][], sentinel: string): number
function extractSection(raw: string[][], startIdx: number): string[][]

function parseSalesBreakdown(section: string[][]): SalesBreakdown
function parseSalesByProduct(section: string[][]): ProductSalesRow[]
function parseConversionFunnel(section: string[][]): ConversionFunnel
function parseSessionsByLocation(section: string[][]): LocationRow[]
function parseSessionsByReferrer(section: string[][]): ReferrerRow[]
function parseSessionsByLandingPage(section: string[][]): LandingPageRow[]
function parseOrdersByHour(section: string[][]): HourlyOrdersRow[]

function n(v: unknown): number
function parseRate(v: unknown): number
function normalizeKey(k: string): string
```

---

## 6. Async Fetch Wrapper Signature

```typescript
// lib/sheets.ts — add alongside existing fetchBrandData

export async function fetchShopifyAnalytics(
  brand: Brand
): Promise<ShopifyAnalyticsData | null>
```

---

## 7. Implementation Checklist

1. Create `/types/shopify-analytics.ts` with all types from §3c
2. Update `/types/index.ts`: extend `DataSource`, add `NavState`, add fields to `Brand` and `BrandData`
3. Create `/lib/shopify-analytics-parser.ts` implementing all signatures from §5
4. Add `fetchShopifyAnalytics` to `/lib/sheets.ts`
5. Update `config/brands.ts` to add `shopifyAnalyticsSheetName: 'Shopify Analytics'` on ecommerce brands
6. In Google Sheets: create "Shopify Analytics" tab per brand following §4 layout
