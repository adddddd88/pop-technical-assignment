const { z } = require('zod');
const mongoose = require('mongoose');

const isObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

const CreatePurchaseSchema = z.object({
  enterpriseId: z
    .string({ required_error: 'enterpriseId is required' })
    .refine(isObjectId, 'enterpriseId must be a valid MongoDB ObjectId'),

  clientId: z
    .string({ required_error: 'clientId is required' })
    .refine(isObjectId, 'clientId must be a valid MongoDB ObjectId'),

  amount: z
    .number({ required_error: 'amount is required', invalid_type_error: 'amount must be a number' })
    .positive('amount must be greater than 0'),

  category: z
    .string()
    .trim()
    .min(1, 'category cannot be empty if provided')
    .optional(),
});

module.exports = { CreatePurchaseSchema };