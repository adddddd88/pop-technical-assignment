const { ReceiptService } = require('./receipt.service');
const { sendSuccess, sendError } = require('../../utils/response');

class ReceiptController {
  constructor() {
    this.receiptService = new ReceiptService();
    this.extract = this.extract.bind(this);
  }

  async extract(req, res, next) {
    try {
      const { buffer, mimetype } = req.file;

      const result = await this.receiptService.extractReceiptData(buffer, mimetype);

      return sendSuccess(res, result, 200);
    } catch (err) {
      if (err.code === 'OCR_NO_TEXT') {
        return sendError(res, err.code, err.message, 422);
      }
      if (err.code === 'OCR_FAILED') {
        return sendError(res, err.code, 'OCR service failed to process the image', 502);
      }
      if (err.code === 'LLM_FAILED' || err.code === 'LLM_EMPTY_RESPONSE') {
        return sendError(res, err.code, 'LLM service failed to parse the receipt', 502);
      }

      next(err);
    }
  }
}

module.exports = { ReceiptController };
