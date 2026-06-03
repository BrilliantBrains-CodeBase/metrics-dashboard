import { Brand } from '@/types'

// spreadsheetId       = Meta Ads sheet ID
// shopifySpreadsheetId = Shopify sheet ID (ecommerce only, shown by default)
//
// Shopify sheet expected columns (row 1 headers):
//   Date | Sessions | Orders | Revenue | AOV | Conversion Rate | New Customers | Returning Customers
//
// Meta Ads sheet expected columns (row 1 headers):
//   Date | Ad Spend | Revenue | Impressions | Clicks | ATC | Purchases | ROAS | CPA | CR | CTR | AOV

export const BRANDS: Brand[] = [
  {
    id: 'ecom-SCHICK-A-WALK',
    name: 'SCHICK-A-WALK',
    vertical: 'ecommerce',
    spreadsheetId: '1qBBKQJS4x2cjZtMttNwq-R6x7JzfsdmVBkpc4fALkew',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1qBBKQJS4x2cjZtMttNwq-R6x7JzfsdmVBkpc4fALkew',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-osn',
    name: 'OSN',
    vertical: 'ecommerce',
    spreadsheetId: '1LhmdUEZrk5xGp6dfnpDdHu4rk6ZhReisxBNV2GP5lXI',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1LhmdUEZrk5xGp6dfnpDdHu4rk6ZhReisxBNV2GP5lXI',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-Saalvi',
    name: 'Saalvi',
    vertical: 'ecommerce',
    spreadsheetId: '1ucH0BZxVcyfnwCPjXliv3qapCz5ic0t2qbFNg05oCTg',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1ucH0BZxVcyfnwCPjXliv3qapCz5ic0t2qbFNg05oCTg',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-Maniyar Marketing',
    name: 'Maniyar',
    vertical: 'ecommerce',
    spreadsheetId: '1_S5Y626nXq1-gTb1BEnscvIwmYk2wNVzFWmqc-Kjhxc',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1_S5Y626nXq1-gTb1BEnscvIwmYk2wNVzFWmqc-Kjhxc',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-Evday_Marketing_Metrics_Tracker',
    name: 'Evday',
    vertical: 'ecommerce',
    spreadsheetId: '16gb3FXSF3cIG6C5waVXfqWANQQrUY0URDpJKtxUOjFM',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '16gb3FXSF3cIG6C5waVXfqWANQQrUY0URDpJKtxUOjFM',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-Skinloom_Marketing_Metrics_Tracker',
    name: 'Skinloom',
    vertical: 'ecommerce',
    spreadsheetId: '1AqsUH_d7aesZRCUNspkPBbUKz8Hmlj7LG3s2gHrJ8IE',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1AqsUH_d7aesZRCUNspkPBbUKz8Hmlj7LG3s2gHrJ8IE',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'ecom-milkvilla',
    name: 'Milkvilla',
    vertical: 'ecommerce',
    spreadsheetId: '1SZO-oo_yFXNFUEsPikvLVzJZcHl-vWaiE5U4YcLPzAY',
    sheetName: 'Daily Tracker (Meta Ads)',
    shopifySpreadsheetId: '1SZO-oo_yFXNFUEsPikvLVzJZcHl-vWaiE5U4YcLPzAY',
    shopifySheetName: 'Shopify',
  },
  {
    id: 'hospital-Palve labs',
    name: 'Palve Labs',
    vertical: 'hospital',
    spreadsheetId: '1fGCGHQyQo6rv8v6GszzhwDuoTeYXEQ29FQxEPTxaDFQ',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-Rysewell hospital',
    name: 'Rysewell Hospital',
    vertical: 'hospital',
    spreadsheetId: '1anoClVpcFcRhyZA1tfUvB8POrg1AHKkKnoCdEs15mW8',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-clinic2000',
    name: 'Clinic 2000',
    vertical: 'hospital',
    spreadsheetId: '1FCwkBs5RIp172eW847StmE-WStchD4mM9A533VOjvPQ',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-SUNRISE-shamshabad',
    name: 'Sunrise Shamshabad',
    vertical: 'hospital',
    spreadsheetId: '1vr0UmDImaXAB_CLa3Mwa95DyNAHbyEJ2ssSUISOxQJc',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-SUNRISE-himayat',
    name: 'Sunrise Himayat Nagar',
    vertical: 'hospital',
    spreadsheetId: '1c9AyEkUF7DVWxGByXTWrIGmSnTrnfKsfYIikMZrsJHY',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'other-brand-1',
    name: 'Other Brand 1',
    vertical: 'other',
    spreadsheetId: '',
  },
]
