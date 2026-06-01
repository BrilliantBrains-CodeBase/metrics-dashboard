import { Brand } from '@/types'

// Add/remove brands here — no other code changes needed.
//
// spreadsheetId: the ID from your Google Sheets URL
//   https://docs.google.com/spreadsheets/d/{THIS_ID}/edit
//
// sheetName (optional): name of the tab with data. Defaults to the first sheet.
//
// The sheet must be shared: Share → General access → "Anyone with the link" (Viewer)
// A GOOGLE_SHEETS_API_KEY must be set in .env.local
//
// Expected sheet format (row 1 = headers, row 2+ = data):
//   Ecommerce: Date | Ad Spend | Revenue | Impressions | Clicks | ATC | Purchases | ROAS | CPA | CR | CTR | AOV
//   Hospital:  Date | Ad Spend | Impressions | Clicks | Leads | Quality Leads | CPM | CPC | CTR | CR | CPL | Qual % | CPQL

export const BRANDS: Brand[] = [
  {
    id: 'ecom-SCHICK-A-WALK',
    name: 'SCHICK-A-WALK',
    vertical: 'ecommerce',
    spreadsheetId: '1qBBKQJS4x2cjZtMttNwq-R6x7JzfsdmVBkpc4fALkew',   // paste your spreadsheet ID here
    sheetName: 'Daily Tracker (Meta Ads)',       // leave blank for first sheet, or specify tab name e.g. 'Data'
  },
  {
    id: 'ecom-osn',
    name: 'OSN',
    vertical: 'ecommerce',
    spreadsheetId: '1LhmdUEZrk5xGp6dfnpDdHu4rk6ZhReisxBNV2GP5lXI',
    sheetName: 'Daily Tracker (Meta Ads)',
  },
  {
    id: 'other-brand-1',
    name: 'Other Brand 1',
    vertical: 'other',
    spreadsheetId: '',
    sheetName: '',
  },
  {
    id: 'ecom-Maniyar Marketing',
    name: 'Maniyar',
    vertical: 'ecommerce',
    spreadsheetId: '1_S5Y626nXq1-gTb1BEnscvIwmYk2wNVzFWmqc-Kjhxc',
    sheetName: 'Daily Tracker (Meta Ads)',
  },
  {
    id: 'ecom-Evday_Marketing_Metrics_Tracker',
    name: 'Evday',
    vertical: 'ecommerce',
    spreadsheetId: '16gb3FXSF3cIG6C5waVXfqWANQQrUY0URDpJKtxUOjFM',
    sheetName: 'Daily Tracker (Meta Ads)',
  },
  { id: 'ecom-Skinloom_Marketing_Metrics_Tracker',
    name: 'Skinloom',
    vertical: 'ecommerce',
    spreadsheetId: '1AqsUH_d7aesZRCUNspkPBbUKz8Hmlj7LG3s2gHrJ8IE/',
    sheetName: 'Daily Tracker (Meta Ads)',
  },
  {
    id: 'hospital-Palve labs',
    name: 'Palve lab',
    vertical: 'hospital',
    spreadsheetId: '1fGCGHQyQo6rv8v6GszzhwDuoTeYXEQ29FQxEPTxaDFQ',
    sheetName: 'Meta Ads - Daily',
  },
   {
    id: 'hospital-Rysewell hospital',
    name: 'Rysewell hospital',
    vertical: 'hospital',
    spreadsheetId: '1anoClVpcFcRhyZA1tfUvB8POrg1AHKkKnoCdEs15mW8',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'ecom-milkvilla',
    name: 'milkvilla',
    vertical: 'ecommerce',
    spreadsheetId: '1SZO-oo_yFXNFUEsPikvLVzJZcHl-vWaiE5U4YcLPzAY',
    sheetName: 'Daily Tracker (Meta Ads)',
  },
  {
    id: 'hospital-clinic2000',
    name: 'Hospital clinic2000', 
    vertical: 'hospital',
    spreadsheetId: '1FCwkBs5RIp172eW847StmE-WStchD4mM9A533VOjvPQ',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-SUNRISE HOSPITAL shamshabad',
    name: 'Hospital SUNRISE HOSPITAL shamshabad',
    vertical: 'hospital',
    spreadsheetId: '1vr0UmDImaXAB_CLa3Mwa95DyNAHbyEJ2ssSUISOxQJc',
    sheetName: 'Meta Ads - Daily',
  },
  {
    id: 'hospital-SUNRISE HOSPITAL HIMAYAT NAGAR',
    name: 'SUNRISE HOSPITAL HIMAYAT NAGAR',
    vertical: 'hospital',
    spreadsheetId: '1c9AyEkUF7DVWxGByXTWrIGmSnTrnfKsfYIikMZrsJHY',
    sheetName: 'Meta Ads - Daily',
  },
]
