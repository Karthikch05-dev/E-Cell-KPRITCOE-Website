# Google Apps Script Registration System Setup

This document explains how to set up the Google Apps Script Web App to handle E-Cell KPRIT-COE registration submissions.

## Architecture Overview

```
React Registration Form
        ↓
    Supabase
        ↓
Supabase Edge Function
        ↓
Google Apps Script Web App
        ↓
    ├─ Google Sheet (Registrations)
    └─ Gmail (Confirmation Email)
```

## Prerequisites

- A Google Account with access to Google Drive
- A Google Spreadsheet (we'll create one)
- Access to Google Apps Script (included with Google account)
- A Supabase project with Edge Functions enabled

## Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Create** → **Spreadsheet**
3. Name it: `E-Cell KPRIT-COE Registrations`
4. Open the spreadsheet
5. The sheet should be named `Sheet1` (rename it to `Registrations` if desired)
6. Copy the **Spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Example: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

## Step 2: Create Google Apps Script

1. In the same spreadsheet, go to **Extensions** → **Apps Script**
2. This opens the Apps Script editor
3. Delete any existing code
4. Copy the complete code below into the Apps Script editor
5. Click **File** → **Save**
6. Project name: `E-Cell Registration Handler`

## Step 3: Google Apps Script Code

Replace all content in `Code.gs` with this code:

```javascript
// Configuration
function getConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  return {
    spreadsheetId: properties.getProperty('SPREADSHEET_ID'),
    sharedSecret: properties.getProperty('APP_SCRIPT_SHARED_SECRET'),
    sheetName: 'Registrations'
  };
}

// Setup function - Run this first to initialize
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const properties = PropertiesService.getScriptProperties();
  
  // Get the current spreadsheet ID
  const spreadsheetId = ss.getId();
  
  // Store configuration
  properties.setProperty('SPREADSHEET_ID', spreadsheetId);
  
  Logger.log('Spreadsheet ID: ' + spreadsheetId);
  
  // Ensure Registrations sheet exists
  let sheet = ss.getSheetByName('Registrations');
  if (!sheet) {
    sheet = ss.insertSheet('Registrations');
    Logger.log('Created Registrations sheet');
  }
  
  // Add headers if they don't exist
  const range = sheet.getRange(1, 1, 1, 11);
  const values = range.getValues();
  
  if (values[0][0] === '') {
    const headers = [
      'Registration ID',
      'Timestamp',
      'Full Name',
      'Email',
      'Phone',
      'College',
      'Year',
      'Department',
      'Event',
      'Team Size',
      'Email Status'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    Logger.log('Headers created');
  }
  
  Logger.log('Setup completed successfully');
}

// Main handler - receives POST requests from Supabase Edge Function
function doPost(e) {
  try {
    // Get configuration
    const config = getConfig();
    
    // If secret is not configured, show setup instructions
    if (!config.sharedSecret) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'Apps Script not configured. Run setup() first and set APP_SCRIPT_SHARED_SECRET in Script Properties.'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the request body
    const payload = JSON.parse(e.postData.contents);
    
    Logger.log('Received registration request: ' + JSON.stringify(payload));
    
    // Validate shared secret
    if (payload.secret !== config.sharedSecret) {
      Logger.log('Unauthorized: Invalid secret');
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'Unauthorized - Invalid secret'
        })
      ).setMimeType(ContentService.MimeType.JSON)
        .setHttpHeaders({ 'Access-Control-Allow-Origin': '*' });
    }
    
    // Validate required fields
    const requiredFields = ['registrationId', 'name', 'email', 'event'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        Logger.log('Missing required field: ' + field);
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: 'Missing required field: ' + field
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Get the Registrations sheet
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('Registrations sheet not found');
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'Registrations sheet not found. Run setup() first.'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check for duplicate registration
    const allData = sheet.getDataRange().getValues();
    let isDuplicate = false;
    
    for (let i = 1; i < allData.length; i++) { // Skip header row
      if (allData[i][0] === payload.registrationId) {
        isDuplicate = true;
        Logger.log('Duplicate registration found: ' + payload.registrationId);
        break;
      }
    }
    
    if (isDuplicate) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          duplicate: true,
          message: 'Registration already processed'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare row data
    const timestamp = new Date().toISOString();
    const rowData = [
      payload.registrationId,
      timestamp,
      payload.name,
      payload.email,
      payload.phone || '',
      payload.college || '',
      payload.year || '',
      payload.department || '',
      payload.event,
      payload.teamSize || 1,
      'Pending'
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    Logger.log('Row added to sheet');
    
    // Send confirmation email
    let emailStatus = 'Email Failed';
    try {
      sendConfirmationEmail(payload);
      emailStatus = 'Email Sent';
      Logger.log('Confirmation email sent to: ' + payload.email);
    } catch (emailError) {
      Logger.log('Email send error: ' + emailError.toString());
      // Email failed, but we still keep the registration in the sheet
    }
    
    // Update email status in the sheet
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 11).setValue(emailStatus);
    
    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Registration stored and confirmation email sent',
        registrationId: payload.registrationId,
        emailStatus: emailStatus
      })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHttpHeaders({ 'Access-Control-Allow-Origin': '*' });
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHttpHeaders({ 'Access-Control-Allow-Origin': '*' });
  }
}

// Send confirmation email using Gmail
function sendConfirmationEmail(registration) {
  const {
    name,
    email,
    event,
    registrationId,
    teamSize,
    college,
    year,
    department,
    phone
  } = registration;
  
  // Email subject
  const subject = `Registration Confirmed – ${event}`;
  
  // Email HTML body
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #172b57 0%, #f15a24 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            background: white;
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #172b57;
            font-weight: 600;
          }
          .message {
            margin-bottom: 30px;
            color: #666;
          }
          .details-section {
            background: #f0f4f8;
            border-left: 4px solid #f15a24;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .details-section h3 {
            margin: 0 0 15px 0;
            color: #172b57;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .detail-label {
            color: #666;
            font-weight: 500;
          }
          .detail-value {
            color: #172b57;
            font-weight: 600;
            text-align: right;
          }
          .next-steps {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #e0e0e0;
          }
          .next-steps h3 {
            color: #172b57;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .next-steps ul {
            margin: 0;
            padding-left: 20px;
            color: #666;
          }
          .next-steps li {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          .cta-button {
            display: inline-block;
            background: #f15a24;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${escapeHtml(name)},</div>
            
            <div class="message">
              <p>Thank you for registering for the E-Cell KPRIT-COE event! We're thrilled to have you on board. Your registration has been successfully received and confirmed.</p>
            </div>
            
            <div class="details-section">
              <h3>Registration Details</h3>
              <div class="detail-row">
                <span class="detail-label">Registration ID:</span>
                <span class="detail-value">${escapeHtml(registrationId)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event:</span>
                <span class="detail-value">${escapeHtml(event)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Team Size:</span>
                <span class="detail-value">${teamSize} Member(s)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">College/Institution:</span>
                <span class="detail-value">${escapeHtml(college || 'N/A')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Year:</span>
                <span class="detail-value">${escapeHtml(year || 'N/A')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${escapeHtml(department || 'N/A')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${escapeHtml(email)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${escapeHtml(phone || 'N/A')}</span>
              </div>
            </div>
            
            <div class="next-steps">
              <h3>What's Next?</h3>
              <ul>
                <li>Keep this email for your records</li>
                <li>Check your email regularly for event updates and announcements</li>
                <li>Make sure to arrive on time on the event day</li>
                <li>Bring any required documents if applicable</li>
                <li>Feel free to reach out if you have any questions</li>
              </ul>
            </div>
            
            <div class="message">
              <p>We look forward to seeing you at the event! If you have any questions or need to make changes to your registration, please reply to this email.</p>
              <p><strong>Best regards,</strong><br><strong>E-Cell KPRIT-COE Team</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2024-2025 Entrepreneurship Cell - KPRIT College of Engineering.</p>
            <p>All rights reserved. | <a href="https://ecell-kprit.dev" style="color: #999;">Visit our website</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  // Send the email
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlBody,
    from: Session.getActiveUser().getEmail()
  });
}

// Utility function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## Step 4: Configure Script Properties

1. In Apps Script editor, click **Project Settings** (gear icon)
2. Find the **Script ID** and copy it
3. In the Apps Script editor, click **Services** (left sidebar)
4. Ensure `Gmail API` is enabled

Now set the configuration:

1. Click **File** → **Project Settings**
2. Note the **Script ID**
3. Go back to the editor
4. Click the **Execute** button (▶️) next to `setup` function
5. You'll see: "Authorization required - Click to authorize"
6. Click and authorize the script

This will:
- Set the spreadsheet ID
- Create the `Registrations` sheet
- Add headers

## Step 5: Authorize the Script

1. In the left sidebar, click **Executions** to see the logs
2. The `setup()` function should have completed
3. Check your Google Sheet - it should now have headers in row 1

## Step 6: Deploy as Web App

1. Click **Deploy** (top right)
2. Click **New deployment**
3. Select **Type**: Choose **Web app**
4. **Execute as**: Select your email (the account that owns this script)
5. **Who has access**: Select **Anyone**
6. Click **Deploy**
7. Copy the **Deployment URL** - it looks like:
   ```
   https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
   ```

## Step 7: Set Up Shared Secret

1. In your Apps Script editor, click **Project Settings** (gear icon)
2. Find **Script Properties** section
3. Click **Add property**
4. Add these properties:
   - **Key**: `APP_SCRIPT_SHARED_SECRET`
   - **Value**: Create a random secret (e.g., `your_random_secret_here_123456789`)

**Save this secret value - you'll need it for Supabase.**

## Step 8: Configure Supabase Secrets

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard)
2. Go to **Edge Functions** → **send-registration-email** (or the function name)
3. Click **Secrets** tab
4. Add these secrets:
   - **Key**: `APP_SCRIPT_WEB_APP_URL`
   - **Value**: The deployment URL from Step 6 (the `usercontent` version)
   
   Then add:
   - **Key**: `APP_SCRIPT_SHARED_SECRET`
   - **Value**: The secret from Step 7

5. Click **Save**

## Step 9: Test the Integration

1. Go to your E-Cell website registration form
2. Fill in the form with test data
3. Click **Submit Registration**
4. Check your email for the confirmation email
5. Check the Google Sheet - a new row should be added

Expected behavior:
- ✅ Registration saves to Supabase
- ✅ Email confirmation is sent
- ✅ Google Sheet row is added
- ✅ Email Status shows "Email Sent"

## Troubleshooting

### Email not sending
1. Check Apps Script logs: **Executions** tab
2. Verify Gmail is enabled in the Google Account
3. Verify Apps Script has Gmail permission

### Google Sheet not updating
1. Check Apps Script logs for errors
2. Verify spreadsheet ID is correct in Script Properties
3. Run `setup()` function again

### Receiving "Invalid secret" error
1. Verify the secret in Apps Script Project Properties matches Supabase secrets
2. Re-check spelling and spacing

### Duplicate protection not working
1. Verify the Registration ID column is correct (should be column A)
2. Check the sheet name is exactly "Registrations"

## Reference: Sheet Columns

The Google Sheet uses these columns:

| # | Name | Description |
|---|------|-------------|
| A | Registration ID | Unique ID from Supabase |
| B | Timestamp | When registered (ISO format) |
| C | Full Name | Registrant's name |
| D | Email | Registrant's email |
| E | Phone | Registrant's phone |
| F | College | College/Institution |
| G | Year | Year of study |
| H | Department | Department |
| I | Event | Event name |
| J | Team Size | Number of team members |
| K | Email Status | Email Sent / Email Failed / Already Processed |

## Reference: Apps Script Functions

### `setup()`
Initializes the spreadsheet and creates necessary headers. **Run this once after creating the Apps Script.**

### `doPost(e)`
Receives POST requests from Supabase Edge Function. Validates secret, checks for duplicates, adds to sheet, sends email.

### `sendConfirmationEmail(registration)`
Sends confirmation email using Gmail.

### `getConfig()`
Retrieves configuration from Script Properties.

## Security Notes

1. **Shared Secret**: Keep it random and long (20+ characters)
2. **Never commit secrets to Git**
3. **Google Sheet**: Only accessible to the account that owns the Apps Script
4. **Email sending**: Uses the Gmail account of the script owner
5. **Apps Script deployment**: Set to "Anyone" but validates with shared secret

## Support

For issues:
1. Check Apps Script logs: **Executions** tab
2. Check Supabase Edge Function logs: Dashboard → Functions
3. Check browser console for frontend errors
4. Verify all URLs and secrets are correct (no typos)
