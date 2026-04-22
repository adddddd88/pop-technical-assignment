const { GoogleGenAI } = require('@google/genai');
const { logger } = require('../../utils/logger');

let genai = null;

const getClient = () => {
  if (genai) return genai;
  genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return genai;
};

const PROMPT = `You are a receipt data extraction assistant.
Extract exactly three fields from the raw receipt text below.
Respond ONLY with a valid JSON object — no explanation, no markdown, no code blocks.

Rules:
- amount: positive number (float). The total amount paid. Must be positive.
- date: ISO format YYYY-MM-DD. If year is missing assume current year.
- reference: the ticket, receipt, invoice or transaction reference number as a string.
- If a field cannot be found or is ambiguous set it to null.

Example output:
{"amount": 485.00, "date": "2026-04-22", "reference": "TKT-00445"}`;

const parseReceiptText = async (rawText) => {

  const client = getClient();

  logger.info('Sending OCR text to Gemini for parsing');

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [{ text: `${PROMPT}\n\nReceipt text:\n${rawText}` }],
      },
    ],
  });

  const raw = response.text?.trim() ?? '';

  if (!raw) {
    const err = new Error('Gemini returned empty response');
    err.code = 'LLM_EMPTY_RESPONSE';
    throw err;
  }

  logger.info('Gemini parsing complete', { raw });

  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { parseReceiptText };