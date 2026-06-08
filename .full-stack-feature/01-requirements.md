# Requirements: Complete Dashboard Redesign with Sidebar Nav & Brand Sub-Dashboards

## Problem Statement

A digital marketing agency manages multiple ecommerce brands and currently has to jump between Shopify admin, Meta Ads Manager, and Google Ads to review each brand's performance. The current dashboard has a flat top-nav layout that conflates all data sources. The goal is a single, modern dashboard shell where the agency team can navigate by vertical → brand → data source and see all relevant KPIs in one place — with rich Shopify analytics as the first fully-functional data source.

## Acceptance Criteria

- [ ] Modern sidebar + top bar shell replaces the current top-nav-only layout
- [ ] Sidebar provides navigation: Vertical → Brand → Data Source (Shopify / Google Ads / Meta Ads / Interakt)
- [ ] Summary KPI cards: Total Orders, Gross Sales, Net Sales, Returns, AOV — rendered from real Shopify sheet data
- [ ] Total Sales Breakdown card: Gross Sales, Discounts, Returns, Net Sales, Shipping, Taxes, Total Sales line items
- [ ] Sales by Product horizontal bar chart: top N products by revenue
- [ ] Conversion Rate Breakdown funnel card: Sessions → Add to Cart → Reached Checkout → Completed Checkout (counts + %)
- [ ] Sessions by Location table: Country · State · City with session counts
- [ ] Sessions by Social Referrer table: referrer source + session counts
- [ ] Sessions by Landing Page table: page type · URL · session counts
- [ ] Orders by Time of Day chart: bar chart showing order volume bucketed by hour
- [ ] Google Ads, Meta Ads, and Interakt tabs render as blank placeholder panels
- [ ] Date range filter (yesterday / 7d / 30d / 90d / all) works across all Shopify cards
- [ ] Brand selector in sidebar switches context and reloads all Shopify cards
- [ ] No login/auth UI required

## Scope

### In Scope

- New sidebar navigation shell (collapsible, responsive)
- Top bar with brand name, date range picker, loading indicator
- Shopify sub-dashboard: all 8 cards/sections listed in acceptance criteria
- Blank placeholder panels for Google Ads, Meta Ads, Interakt
- Summary dashboard for ecommerce vertical (aggregated KPIs across all brands)
- Data fetched from two Google Sheets per brand:
  - Sheet 1 (existing): daily Shopify rows — Date, Gross Sales, Discounts, Returns, Net Sales, Total Sales, Orders, AOV
  - Sheet 2 (new "Shopify Analytics" tab): aggregated analytics — product sales, sessions by location/referrer/landing page, conversion funnel, orders by hour
- Existing `/api/sheets` route reused without modification

### Out of Scope

- Real data integration for Google Ads, Meta Ads, and Interakt (placeholder UI only)
- User authentication / login screens
- Hospital and Other vertical redesigns (they will be removed or kept minimal — no active work)
- Any new backend services, databases, or infrastructure changes
- Mobile-native app or PWA

## Technical Constraints

- **Data layer unchanged**: All data continues to flow through the existing `/api/sheets` Google Sheets REST route
- **Stack locked**: Next.js 15 (App Router), Tailwind CSS, Recharts — no new libraries beyond what is already installed
- **No new backend**: All logic stays client-side or in existing Next.js API routes
- **Existing `config/brands.ts` pattern**: Brand registry is extended, not replaced
- **Existing `types/index.ts`**: New types are added; existing types are not broken

## Technology Stack

- **Frontend**: Next.js 15 (App Router, `'use client'` components), React 18, TypeScript
- **Styling**: Tailwind CSS (utility-first, no component library)
- **Charts**: Recharts (already installed)
- **Data**: Google Sheets API via existing `/api/sheets` route
- **Deployment**: Vercel (existing)

## Dependencies

- Existing `/api/sheets` route must continue to work as-is
- `config/brands.ts` requires a new optional field `shopifyAnalyticsSheetName` per brand
- New "Shopify Analytics" Google Sheet tab must be manually created per brand and populated with aggregated data (outside scope of this build — dashboard will show empty state gracefully)

## Configuration

- Stack: Next.js 15 / Tailwind CSS / Recharts
- API Style: REST (Google Sheets)
- Complexity: Complex
