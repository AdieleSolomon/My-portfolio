const crypto = require("crypto");
const { google } = require("googleapis");
const twilio = require("twilio");

const SHEET_HEADERS = [
  "id",
  "createdAt",
  "fullName",
  "email",
  "company",
  "projectType",
  "budgetRange",
  "timeline",
  "goals",
  "mustHaveFeatures",
  "referenceUrl",
  "preferredContact",
];

const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "projectType",
  "budgetRange",
  "timeline",
  "goals",
  "preferredContact",
];

const MAX_TEXT_LENGTH = {
  fullName: 120,
  email: 160,
  company: 160,
  projectType: 120,
  budgetRange: 120,
  timeline: 120,
  goals: 3200,
  mustHaveFeatures: 2200,
  referenceUrl: 500,
  preferredContact: 80,
};

let cachedSheetsService = null;
let cachedTwilioClient = null;

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const sanitizeText = (value, maxLength = 500) => {
  const parsedValue = String(value || "").trim();
  if (!parsedValue) return "";
  return parsedValue.slice(0, maxLength);
};

const normalizeEmail = (value) => sanitizeText(value, MAX_TEXT_LENGTH.email).toLowerCase();

const normalizePhoneValue = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "");

const parseRequestBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      throw createHttpError(400, "Invalid JSON payload.");
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch (error) {
      throw createHttpError(400, "Invalid JSON payload.");
    }
  }
  if (typeof req.body === "object") {
    return req.body;
  }
  throw createHttpError(400, "Invalid request body.");
};

const normalizePrivateKey = (rawPrivateKey) =>
  String(rawPrivateKey || "").replace(/\\n/g, "\n");

const indexToColumnLetter = (index) => {
  let remainder = index;
  let result = "";
  while (remainder > 0) {
    const chunk = (remainder - 1) % 26;
    result = String.fromCharCode(65 + chunk) + result;
    remainder = Math.floor((remainder - 1) / 26);
  }
  return result;
};

const getSheetConfig = () => {
  const spreadsheetId = sanitizeText(process.env.GOOGLE_SHEETS_BRIEFS_SPREADSHEET_ID, 256);
  const serviceAccountEmail = sanitizeText(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    256
  );
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  const sheetName =
    sanitizeText(process.env.GOOGLE_SHEETS_BRIEFS_SHEET_NAME, 120) || "Briefs";

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    throw createHttpError(
      500,
      "Google Sheets storage is not configured. Set GOOGLE_SHEETS_BRIEFS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
    sheetName,
  };
};

const getSheetsService = async () => {
  if (cachedSheetsService) return cachedSheetsService;
  const config = getSheetConfig();
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();
  cachedSheetsService = {
    ...config,
    sheets: google.sheets({ version: "v4", auth }),
  };
  return cachedSheetsService;
};

const ensureSheetHeaders = async (service) => {
  const lastHeaderColumn = indexToColumnLetter(SHEET_HEADERS.length);
  const headerRange = `${service.sheetName}!A1:${lastHeaderColumn}1`;
  const headerResult = await service.sheets.spreadsheets.values.get({
    spreadsheetId: service.spreadsheetId,
    range: headerRange,
  });

  const existingHeader = headerResult.data.values?.[0] || [];
  const headerMatches =
    existingHeader.length === SHEET_HEADERS.length &&
    SHEET_HEADERS.every((value, index) => existingHeader[index] === value);

  if (!headerMatches) {
    await service.sheets.spreadsheets.values.update({
      spreadsheetId: service.spreadsheetId,
      range: `${service.sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [SHEET_HEADERS] },
    });
  }
};

const buildBriefFromPayload = (payload) => {
  const brief = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    fullName: sanitizeText(payload.fullName || payload.full_name, MAX_TEXT_LENGTH.fullName),
    email: normalizeEmail(payload.email),
    company: sanitizeText(payload.company, MAX_TEXT_LENGTH.company) || "Not provided",
    projectType: sanitizeText(
      payload.projectType || payload.project_type,
      MAX_TEXT_LENGTH.projectType
    ),
    budgetRange: sanitizeText(
      payload.budgetRange || payload.budget_range,
      MAX_TEXT_LENGTH.budgetRange
    ),
    timeline: sanitizeText(payload.timeline, MAX_TEXT_LENGTH.timeline),
    goals: sanitizeText(payload.goals, MAX_TEXT_LENGTH.goals),
    mustHaveFeatures:
      sanitizeText(
        payload.mustHaveFeatures || payload.must_have_features,
        MAX_TEXT_LENGTH.mustHaveFeatures
      ) || "Not provided",
    referenceUrl:
      sanitizeText(
        payload.referenceUrl || payload.reference_url,
        MAX_TEXT_LENGTH.referenceUrl
      ) || "Not provided",
    preferredContact: sanitizeText(
      payload.preferredContact || payload.preferred_contact,
      MAX_TEXT_LENGTH.preferredContact
    ),
  };

  REQUIRED_FIELDS.forEach((field) => {
    if (!brief[field]) {
      throw createHttpError(400, `Missing required field: ${field}`);
    }
  });

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email);
  if (!emailIsValid) {
    throw createHttpError(400, "Please provide a valid email address.");
  }

  return brief;
};

const appendBriefToSheet = async (brief) => {
  const service = await getSheetsService();
  await ensureSheetHeaders(service);
  const rowValues = SHEET_HEADERS.map((header) => brief[header] || "");

  await service.sheets.spreadsheets.values.append({
    spreadsheetId: service.spreadsheetId,
    range: `${service.sheetName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowValues] },
  });
};

const mapRowToBrief = (row) => {
  const brief = {};
  SHEET_HEADERS.forEach((header, index) => {
    brief[header] = row[index] || "";
  });
  return brief;
};

const listBriefsFromSheet = async () => {
  const service = await getSheetsService();
  await ensureSheetHeaders(service);
  const lastColumn = indexToColumnLetter(SHEET_HEADERS.length);
  const dataRange = `${service.sheetName}!A2:${lastColumn}`;

  const response = await service.sheets.spreadsheets.values.get({
    spreadsheetId: service.spreadsheetId,
    range: dataRange,
  });

  const rows = response.data.values || [];
  const briefs = rows
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map(mapRowToBrief);

  briefs.sort((a, b) => {
    const aTime = Date.parse(a.createdAt || 0);
    const bTime = Date.parse(b.createdAt || 0);
    return bTime - aTime;
  });

  return briefs;
};

const buildNotificationMessage = (brief) => {
  const compactGoals =
    brief.goals && brief.goals.length > 180
      ? `${brief.goals.slice(0, 180)}...`
      : brief.goals || "Not provided";

  return [
    "New project brief submitted",
    `Name: ${brief.fullName}`,
    `Email: ${brief.email}`,
    `Project Type: ${brief.projectType}`,
    `Budget: ${brief.budgetRange}`,
    `Timeline: ${brief.timeline}`,
    `Preferred Contact: ${brief.preferredContact}`,
    `Goals: ${compactGoals}`,
    "Dashboard: /project-briefs.html",
  ].join("\n");
};

const getTwilioClient = () => {
  if (cachedTwilioClient) return cachedTwilioClient;

  const accountSid = sanitizeText(process.env.TWILIO_ACCOUNT_SID, 80);
  const authToken = sanitizeText(process.env.TWILIO_AUTH_TOKEN, 160);
  if (!accountSid || !authToken) return null;

  cachedTwilioClient = twilio(accountSid, authToken);
  return cachedTwilioClient;
};

const sendNotification = async (brief) => {
  const client = getTwilioClient();
  if (!client) {
    return {
      sent: false,
      reason: "twilio_not_configured",
    };
  }

  const channel = sanitizeText(process.env.BRIEF_ALERT_CHANNEL, 20).toLowerCase() || "whatsapp";
  const toRaw = normalizePhoneValue(process.env.BRIEF_ALERT_TO || "+2348069383370");
  const fromRaw = normalizePhoneValue(
    process.env.TWILIO_MESSAGE_FROM ||
      process.env.TWILIO_WHATSAPP_FROM ||
      process.env.TWILIO_SMS_FROM
  );

  if (!toRaw || !fromRaw) {
    return {
      sent: false,
      reason: "missing_sender_or_destination",
    };
  }

  let to = toRaw;
  let from = fromRaw;
  if (channel === "whatsapp") {
    if (!to.startsWith("whatsapp:")) to = `whatsapp:${to}`;
    if (!from.startsWith("whatsapp:")) from = `whatsapp:${from}`;
  }

  await client.messages.create({
    to,
    from,
    body: buildNotificationMessage(brief),
  });

  return {
    sent: true,
    channel,
  };
};

module.exports = async (req, res) => {
  res.setHeader("Allow", "GET, POST");

  try {
    if (req.method === "GET") {
      const briefs = await listBriefsFromSheet();
      return res.status(200).json({
        ok: true,
        briefs,
      });
    }

    if (req.method === "POST") {
      const payload = parseRequestBody(req);
      const honeypotValue = sanitizeText(payload.website, 120);
      if (honeypotValue) {
        return res.status(202).json({
          ok: true,
          message: "Submission accepted.",
        });
      }

      const brief = buildBriefFromPayload(payload);
      await appendBriefToSheet(brief);
      let notification = {
        sent: false,
        reason: "not_attempted",
      };

      try {
        notification = await sendNotification(brief);
      } catch (notificationError) {
        notification = {
          sent: false,
          reason: "notification_failed",
          message: notificationError.message,
        };
      }

      return res.status(201).json({
        ok: true,
        brief,
        notification,
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed.",
    });
  } catch (error) {
    const statusCode = Number(error.status) || 500;
    return res.status(statusCode).json({
      ok: false,
      message: error.message || "Unexpected server error.",
    });
  }
};
