const { z } = require('zod');

/**
 * Validates the raw LLM output.
 * All fields are optional at this stage — missing/invalid fields are
 * caught here and handled gracefully in the service (confidence = 'low').
 */
const LLMOutputSchema = z.object({
  amount: z
    .number()
    .positive('amount must be a positive number')
    .nullable()
    .optional(),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
    .refine((val) => !isNaN(Date.parse(val)), 'date must be a valid date')
    .nullable()
    .optional(),

  reference: z
    .string()
    .min(1, 'reference cannot be empty')
    .nullable()
    .optional(),
});

module.exports = { LLMOutputSchema };
