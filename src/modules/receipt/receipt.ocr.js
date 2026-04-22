const { GoogleGenAI } = require('@google/genai');
const { logger } = require('../../utils/logger');

let genai = null;

const getClient = () => {
  if (genai) return genai;
  genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return genai;
};

const extractTextFromImage = async (imageBuffer, mimeType) => {

  const client = getClient();

  logger.info('Starting OCR extraction with Gemini Vision', {
    mimeType,
    size: imageBuffer.length,
  });

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBuffer.toString('base64'),
            },
          },
          {
            text:
              'Extract and return ONLY the raw text visible in this receipt image. ' +
              'Do not interpret, structure, or summarize — just return the text exactly as it appears.',
          },
        ],
      },
    ],
  });

  const rawText = response.text?.trim() ?? '';

  if (!rawText) {
    const err = new Error('OCR returned no text — image may be blank or unreadable');
    err.code = 'OCR_NO_TEXT';
    throw err;
  }

  logger.info('OCR extraction complete', { extractedLength: rawText.length });
  return rawText;
};

module.exports = { extractTextFromImage };