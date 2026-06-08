# Frontend Implementation

## Files Created (19 new files)

### Shell Components
| File | Description |
|---|---|
| `components/shell/AppSidebar.tsx` | Sidebar root: logo, vertical sections, collapse toggle. `w-56` expanded / `w-16` collapsed with `transition-all`. |
| `components/shell/SidebarVerticalSection.tsx` | Collapsible section per vertical (Ecommerce/Healthcare/Other) with chevron toggle. |
| `components/shell/SidebarBrandItem.tsx` | Brand row with 2-letter avatar chip. Active brand shows blue highlight + inline data-source sub-list. |
| `components/shell/SidebarDataSourceList.tsx` | Data source pills: Shopify/Google Ads/Meta Ads/Interakt for ecommerce; Meta Ads only for hospital/other. |
| `components/shell/TopBar.tsx` | Top bar: hamburger toggle, breadcrumb (Vertical › Brand › Source), DateRangeFilter, loading spinner. |

### Shopify Dashboard
| File | Description |
|---|---|
| `components/ecom/ShopifyDashboard.tsx` | Container: fetches `ShopifyAnalyticsData` per brand (cached in `useRef`, guarded against concurrent fetches). Renders all 8 cards. |
| `components/ecom/ShopifyKpiRow.tsx` | 5 KPI tiles: Gross Sales, Net Sales, Total Orders, Returns, AOV. Uses `sumShopify(filteredRows)` with half-period trend. |
| `components/ecom/SalesBreakdownCard.tsx` | Waterfall list: Gross → Discounts (red) → Returns (red) → Net Sales (bold) → Shipping → Return Fees → Taxes → Total Sales. |
| `components/ecom/SalesByProductChart.tsx` | Horizontal bar chart (CSS, no Recharts needed). Top N products sorted by revenue, width as % of max. |
| `components/ecom/ConversionFunnelCard.tsx` | Overall conversion rate + 4-step grid (rate + count) + mini bar chart per step. |
| `components/ecom/SessionsByLocationTable.tsx` | Location rows with sky-blue progress bars and session counts. |
| `components/ecom/SessionsByReferrerTable.tsx` | Referrer rows with violet progress bars. |
| `components/ecom/SessionsByLandingPageTable.tsx` | Numbered list: pageType · URL right-aligned bold count. |
| `components/ecom/OrdersByHourChart.tsx` | Recharts BarChart 0–23h with peak hour highlighted in blue-500, others in blue-200. |

### Placeholder Panels
| File | Description |
|---|---|
| `components/placeholders/GoogleAdsPanel.tsx` | Centered icon + "coming soon" message |
| `components/placeholders/MetaAdsPanel.tsx` | Same pattern |
| `components/placeholders/InteraktPanel.tsx` | Same pattern |

## Files Modified

### `app/layout.tsx`
Changed `<body>` class from `min-h-full flex flex-col` to `h-full overflow-hidden` to enable the sidebar fill-screen layout.

### `app/page.tsx` (full replacement)
- New top-level state: `navState: NavState`, `sidebarOpen: boolean`, `dateRange: DateRange`
- Existing data-fetching logic (allBrandData, fetchedRef, fetchBrandData) preserved unchanged
- Layout: `<AppSidebar>` + mobile overlay + `<TopBar>` + `<main>` content area
- Content routing: `navState.dataSource` → `ShopifyDashboard | GoogleAdsPanel | MetaAdsPanel | InteraktPanel`
- Hospital/other verticals: `LegacyKpiView` inline component shows KPI cards using existing `sumHospital` / `sumOther`

## Design Decisions
- No Recharts for most charts — CSS width-percentage bars are simpler, faster, and match the Shopify screenshot aesthetic
- Recharts used only for `OrdersByHourChart` where a real axis/label bar chart is needed
- All cards handle `loading=true` (skeleton pulse) and `data=null` (empty state message) independently
- Mock data is shown immediately when "Shopify Analytics" tab is missing (no empty dashboard)
- `fetchingRef` guards against concurrent duplicate fetches in React StrictMode

## Verified Working
- Dev server running on localhost:3000
- TypeScript: no errors in new files
- Screenshot confirmed: sidebar, topbar, KPI row, sales breakdown, product chart all rendering correctly
- Conversion funnel showing positive rate (0.25%) after mock data fix
