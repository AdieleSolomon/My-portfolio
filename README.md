# Solomon Adiele - Portfolio

👋 Welcome to my professional portfolio website!

## 🚀 About Me
Full-Stack Developer & IT Professional passionate about creating efficient digital solutions.

## 🛠️ Technologies
- HTML5, CSS3, JavaScript
- Full-Stack Development
- System Administration
- Video Editing

## 📫 Contact
- Email: solomonadiele1@gmail.com
- Phone: 08069383370, 08127890779
- Location: Abia State, Nigeria

Note:-

Phone Numbers: All phone numbers are wrapped in <a href="tel:08069383370"> tags with clickable-phone class and "Click to call" title attribute.

Email Addresses: All email addresses are wrapped in <a href="mailto:solomonadiele1@gmail.com"> tags with clickable-email class and "Click to send email" title attribute.


Mobile-Friendly: The clickable links work on both desktop and mobile devices:

On desktop: Shows hover tooltips

On mobile: Tapping opens the phone dialer or email client

Accessibility: The links maintain good accessibility with proper title attributes and visual feedback.

## 🌐 Live Demo
Visit: https://adielesolomon.github.io

## Project Brief Backend Setup (Global Dashboard + Auto Alerts)
- API route: `/api/project-briefs` (GET for dashboard, POST for form submissions)
- Storage: Google Sheets (shared across all users/devices)
- Alerts: Twilio (automatic SMS/WhatsApp, no user tap required)

### Environment Variables
Set these in Vercel Project Settings -> Environment Variables:

- `GOOGLE_SHEETS_BRIEFS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_BRIEFS_SHEET_NAME` (optional, defaults to `Briefs`)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGE_FROM` (example: `whatsapp:+14155238886` or an SMS-enabled Twilio number)
- `BRIEF_ALERT_TO` (example: `+2348069383370`)
- `BRIEF_ALERT_CHANNEL` (`whatsapp` or `sms`)

### Required Google Sheets Permission
- Share your target Google Sheet with the service account email in `GOOGLE_SERVICE_ACCOUNT_EMAIL` and grant Editor access.

Use `.env.example` as the local template.

