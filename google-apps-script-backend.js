/**
 * BACKEND SETUP INSTRUCTIONS FOR EXCEL/GOOGLE SHEETS
 * 
 * Since GitHub Pages only hosts static files, you cannot run Node.js or PHP directly on it.
 * To save form submissions to an Excel sheet for free, we use Google Apps Script.
 * 
 * STEP 1: Go to Google Sheets and create a new blank spreadsheet.
 * STEP 2: Name the first sheet "Sheet1" (default).
 * STEP 3: In the first row, add your column headers exactly matching the 'name' attributes in the HTML form:
 *         A1: timestamp
 *         B1: Name
 *         C1: Email
 *         D1: Phone
 * STEP 4: Click Extensions > Apps Script in the menu.
 * STEP 5: Delete any code there and paste ALL the code below.
 * STEP 6: Click Deploy > New Deployment.
 *         - Select type: "Web App"
 *         - Description: "Form Handler"
 *         - Execute as: "Me"
 *         - Who has access: "Anyone"
 * STEP 7: Click "Deploy" (you will be asked to authorize access to your Google Account).
 * STEP 8: Copy the generated "Web app URL".
 * STEP 9: Go to your index.html file and paste the URL into the `scriptURL` variable near the bottom.
 * 
 * Your HTML form will now send data directly to your Google Sheet, which you can easily download as Excel (.xlsx)!
 */

const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

// This runs once to tie the script to your spreadsheet
function setup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

// Handles the POST request from your HTML form
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    // Map form data to the correct columns based on headers
    const newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header];
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  finally {
    lock.releaseLock();
  }
}
