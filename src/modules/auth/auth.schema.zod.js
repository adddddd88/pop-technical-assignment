const { z } = require('zod');
const mongoose = require('mongoose');

const LoginSchema = z.object({
  enterpriseId: z
    .string({ required_error: 'enterpriseId is required' })
    .refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      'enterpriseId must be a valid MongoDB ObjectId'
    ),
});

module.exports = { LoginSchema };