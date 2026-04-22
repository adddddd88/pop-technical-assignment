const { extractTextFromImage } = require('./receipt.ocr');
const { parseReceiptText } = require('./receipt.llm');
const { LLMOutputSchema } = require('./receipt.schema.zod');
const { logger } = require('../../utils/logger');

class ReceiptService {

  async extractReceiptData(imageBuffer, mimeType) {
    // --- Step 1: OCR ---
    let rawText;
    try {
      rawText = await extractTextFromImage(imageBuffer, mimeType);
    } catch (err) {
      logger.error('OCR step failed', { error: err.message });
      err.code = err.code || 'OCR_FAILED';
      throw err;
    }

    // --- Step 2: LLM parsing ---
    let llmOutput;
    try {
      llmOutput = await parseReceiptText(rawText);
    } catch (err) {
      logger.error('LLM step failed', { error: err.message });
      err.code = err.code || 'LLM_FAILED';
      throw err;
    }

    // --- Step 3: Validate LLM output with Zod ---
    const validation = LLMOutputSchema.safeParse(llmOutput);

    let amount = null;
    let date = null;
    let reference = null;
    const issues = [];

    if (validation.success) {
      amount    = validation.data.amount    ?? null;
      date      = validation.data.date      ?? null;
      reference = validation.data.reference ?? null;

      // Track which fields came back null from LLM
      if (amount    === null) issues.push('amount missing');
      if (date      === null) issues.push('date missing');
      if (reference === null) issues.push('reference missing');
    } else {
      // Zod found structural issues — extract what we can field by field
      const data = llmOutput;

      amount    = typeof data.amount === 'number' && data.amount > 0 ? data.amount : null;
      date      = typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : null;
      reference = typeof data.reference === 'string' && data.reference.length > 0 ? data.reference : null;

      validation.error.issues.forEach((i) => issues.push(i.message));
    }

    // --- Step 4: Confidence ---
    // 'high' only if all three fields extracted cleanly with no issues
    const confidence = issues.length === 0 ? 'high' : 'low';

    logger.info('Receipt extraction complete', {
      amount,
      date,
      reference,
      confidence,
      issues,
    });

    return { amount, date, reference, confidence };
  }
}

module.exports = { ReceiptService };
