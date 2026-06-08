# Architecture: Dashboard Redesign with Sidebar Nav & Brand Sub-Dashboards

---

## 1. Shell Architecture

### 1.1 Layout Composition

`app/page.tsx` becomes the new shell root (`'use client'`). `app/layout.tsx` gets `overflow-hidden h-full` on `<body>`. No new routes needed.

```
<div class="flex h-screen overflow-hidden bg-gray-50">
  <AppSidebar />
  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <TopBar />
    <main class="flex-1 overflow-y-auto p-6">
      <ContentArea />   ← renders active data-source panel
    </main>
  </div>
</div>
```

### 1.2 Sidebar Component Hierarchy

**`components/shell/AppSidebar.tsx`**
- Props: `{ navState, onNavChange, isOpen, onToggle }`
- Width: `w-64` expanded, `w-16` collapsed; `transition-all duration-200`
- Internal layout: logo strip (`shrink-0`) → brand list (`flex-1 overflow-y-auto`) → collapse toggle (`shrink-0`)

**`components/shell/SidebarVerticalSection.tsx`**
- Props: `{ vertical, brands, navState, onNavChange }`
- Local `isExpanded` state, initialized `true` when `navState.vertical === vertical`

**`components/shell/SidebarBrandItem.tsx`**
- Props: `{ brand, navState, onNavChange }`
- On click: `onNavChange({ vertical: brand.vertical, brandId: brand.id, dataSource: 'shopify' })`
- When active: renders `SidebarDataSourceList` indented beneath brand name

**`components/shell/SidebarDataSourceList.tsx`**
- Props: `{ vertical, activeSource, onSourceChange }`
- ecommerce: shopify / google-ads / meta-ads / interakt
- hospital/other: meta-ads only

### 1.3 Top Bar

**`components/shell/TopBar.tsx`**
- Props: `{ brandName, dataSource, dateRange, onDateRangeChange, loading, onMenuToggle }`
- Renders: hamburger → breadcrumb ("eCommerce > Brand > Shopify") → `DateRangeFilter` (reused as-is) → loading spinner

### 1.4 Responsive

- `sidebarOpen` initialized `true` on desktop, `false` if `window.innerWidth < 768` (checked in `useEffect`)
- Mobile: sidebar collapses to `w-0 overflow-hidden`; dark overlay renders when open
- No media query inside components — all gated on `sidebarOpen` boolean

### 1.5 Navigation State

```typescript
// types/index.ts
export interface NavState {
  vertical:   Vertical
  brandId:    string
  dataSource: DataSource
}
```

Single `useState<NavState>` in `page.tsx`. Children receive `navState` + `onNavChange`. Initial value: `{ vertical: 'ecommerce', brandId: firstEcomBrand.id, dataSource: 'shopify' }`.

---

## 2. Shopify Sub-Dashboard Architecture

### 2.1 Component Tree

```
ShopifyDashboard (container — fetches analytics snapshot)
├── ShopifyKpiRow (presentational — uses ShopifyRow[] time-series)
├── SalesBreakdownCard (presentational)
├── SalesByProductChart (presentational — Recharts horizontal BarChart)
├── ConversionFunnelCard (presentational)
├── SessionsByLocationTable (presentational)
├── SessionsByReferrerTable (presentational)
├── SessionsByLandingPageTable (presentational)
└── OrdersByHourChart (presentational — Recharts vertical BarChart)
```

### 2.2 Data Fetching Strategy

| Stream | Type | Source tab | Fetched in | Cache |
|---|---|---|---|---|
| `ShopifyRow[]` | Time-series | "Shopify" | `page.tsx` via `fetchBrandData` | `fetchedRef` (unchanged) |
| `ShopifyAnalyticsData` | Snapshot | "Shopify Analytics" | `ShopifyDashboard` via `fetchShopifyAnalytics` | `analyticsCacheRef: useRef<Record<string,ShopifyAnalyticsData>>` |

`dateRange` filter applies only to `ShopifyRow[]`. Analytics snapshot is always shown in full.

### 2.3 Props Interface Sketches

**`ShopifyDashboard`**: `{ brand: Brand, shopifyRows: ShopifyRow[], dateRange: DateRange }`

**`ShopifyKpiRow`**: `{ rows: ShopifyRow[], loading: boolean }`
— Computes orders, grossSales, netSales, returns, AOV from `sumShopify(rows)`

**`SalesBreakdownCard`**: `{ data: SalesBreakdown | null, loading: boolean }`

**`SalesByProductChart`**: `{ products: ProductSalesRow[], loading: boolean, topN?: number }`

**`ConversionFunnelCard`**: `{ funnel: ConversionFunnel | null, loading: boolean }`

**`SessionsByLocationTable`**: `{ rows: LocationRow[], loading: boolean }`

**`SessionsByReferrerTable`**: `{ rows: ReferrerRow[], loading: boolean }`

**`SessionsByLandingPageTable`**: `{ rows: LandingPageRow[], loading: boolean }`

**`OrdersByHourChart`**: `{ hours: HourlyOrdersRow[], loading: boolean }`

### 2.4 Loading & Empty States

- Loading: `animate-pulse bg-gray-100 rounded-2xl` at expected card height
- Empty / null data: centered "No data" message in rounded card shell
- Analytics tab missing: "Add a 'Shopify Analytics' tab to the spreadsheet" banner in each affected card

---

## 3. New File Structure

### Files to Create

| Path | Description |
|---|---|
| `components/shell/AppSidebar.tsx` | Sidebar root; logo + vertical sections + collapse toggle |
| `components/shell/SidebarVerticalSection.tsx` | Collapsible vertical group |
| `components/shell/SidebarBrandItem.tsx` | Brand row + inline data-source sub-list |
| `components/shell/SidebarDataSourceList.tsx` | Data source pills under active brand |
| `components/shell/TopBar.tsx` | Top bar: hamburger, breadcrumb, date filter, loader |
| `components/ecom/ShopifyDashboard.tsx` | Container: fetches analytics + renders all Shopify cards |
| `components/ecom/ShopifyKpiRow.tsx` | 5-card KPI strip |
| `components/ecom/SalesBreakdownCard.tsx` | Gross → Discounts → Returns → Net → Shipping → Taxes → Total |
| `components/ecom/SalesByProductChart.tsx` | Horizontal bar chart (Recharts) |
| `components/ecom/ConversionFunnelCard.tsx` | Funnel: Sessions → ATC → Checkout → Completed |
| `components/ecom/SessionsByLocationTable.tsx` | Sessions by country/state/city |
| `components/ecom/SessionsByReferrerTable.tsx` | Sessions by social referrer |
| `components/ecom/SessionsByLandingPageTable.tsx` | Sessions by landing page URL |
| `components/ecom/OrdersByHourChart.tsx` | Bar chart: orders by hour of day |
| `components/placeholders/GoogleAdsPanel.tsx` | Blank placeholder for Google Ads tab |
| `components/placeholders/MetaAdsPanel.tsx` | Blank placeholder for Meta Ads tab |
| `components/placeholders/InteraktPanel.tsx` | Blank placeholder for Interakt tab |
| `types/shopify-analytics.ts` | All ShopifyAnalyticsData sub-types |
| `lib/shopify-analytics-parser.ts` | parseShopifyAnalyticsSheet + all sub-parsers |

### Files to Modify

| Path | Change |
|---|---|
| `app/page.tsx` | **Full replacement** — new shell with sidebar/topbar/content and top-level state |
| `app/layout.tsx` | Add `overflow-hidden h-full` to `<body>` |
| `types/index.ts` | Add `NavState`; extend `DataSource` to 4 values; add `shopifyAnalyticsSheetName` to `Brand`; add `shopifyAnalytics?` to `BrandData` |
| `lib/sheets.ts` | Add `fetchShopifyAnalytics(brand)` — existing exports unchanged |
| `config/brands.ts` | Add `shopifyAnalyticsSheetName: 'Shopify Analytics'` to ecommerce brands |

### Files Left Untouched

All `app/api/` routes, `lib/metrics.ts`, `lib/insights.ts`, `lib/report.ts`, all existing chart components.

---

## 4. State Management

| State | Type | Owner |
|---|---|---|
| `navState` | `NavState` | `page.tsx` |
| `sidebarOpen` | `boolean` | `page.tsx` |
| `dateRange` | `DateRange` | `page.tsx` |
| `allBrandData` | `Record<string, BrandData>` | `page.tsx` |
| `loading` | `boolean` | `page.tsx` |
| `fetchedRef` | `useRef<Set<string>>` | `page.tsx` (unchanged) |
| `analyticsCache` | `useRef<Record<string, ShopifyAnalyticsData>>` | `ShopifyDashboard` |
| `analyticsLoading` | `boolean` | `ShopifyDashboard` |
| `isExpanded` | `boolean` | `SidebarVerticalSection` |

No Zustand, Context, or global store — props-down/callbacks-up throughout.

---

## 5. API Integration

### `fetchShopifyAnalytics(brand: Brand): Promise<ShopifyAnalyticsData | null>`
- Added to `lib/sheets.ts`
- Uses `brand.shopifySpreadsheetId` + `brand.shopifyAnalyticsSheetName ?? 'Shopify Analytics'`
- Calls existing `fetchSheetRowsById()` helper — no new HTTP mechanism
- Passes raw `string[][]` to `parseShopifyAnalyticsSheet()` from `lib/shopify-analytics-parser.ts`
- Returns `null` on error (caller shows empty state banner)

### Existing `fetchBrandData()` — unchanged
- Called from `page.tsx` `useEffect` exactly as today
- Result stored in `allBrandData` as before
- `ShopifyDashboard` receives `shopifyRows` as a prop sliced from `allBrandData[brand.id].shopifyRows`

---

## 6. Risk Assessment

### Risk 1 — Sheet column layout inconsistency across brands
Parser uses `normalizeKey`/`pick` alias matching (same pattern as existing `lib/sheets.ts`). Add `console.warn` in dev for unmapped columns. Cards hide rows where value is `0` / `null`.

### Risk 2 — `DataSource` type extension breaks existing `'meta'` string guards
Keep `'meta'` in union during transition: `'shopify' | 'meta' | 'google-ads' | 'meta-ads' | 'interakt'`. Implementation agent does project-wide find-and-replace for `dataSource === 'meta'` → `dataSource === 'meta-ads'` before writing new code.

### Risk 3 — Sidebar taller than viewport clips content
Sidebar internal layout: logo strip (`shrink-0`) + brand list (`flex-1 overflow-y-auto`) + collapse toggle (`shrink-0`). Explicitly specified in `AppSidebar.tsx`.
