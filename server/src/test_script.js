require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function testSheet() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // Pass auth directly
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(`Spreadsheet title: ${doc.title}`);

  // Grab the sheet
  const sheet = doc.sheetsByTitle['Transactions'];
  if (!sheet) {
    console.error("❌ No sheet named 'Transactions' found");
    return;
  }

  const rows = await sheet.getRows();
  console.log('✅ Rows from Google Sheet:', rows.map(r => r._rawData));
}

testSheet().catch(console.error);
