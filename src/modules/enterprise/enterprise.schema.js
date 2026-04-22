const mongoose = require('mongoose');

const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schemas for each loyalty mode
// ---------------------------------------------------------------------------

const LinearConfigSchema = new Schema(
  {
    mode: { type: String, enum: ['linear'], required: true },
    pointsPerMAD: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CategoryRateSchema = new Schema(
  {
    category: { type: String, required: true, lowercase: true, trim: true },
    pointsPerMAD: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CategoryConfigSchema = new Schema(
  {
    mode: { type: String, enum: ['category'], required: true },
    defaultPointsPerMAD: { type: Number, required: true, min: 0 },
    rates: { type: [CategoryRateSchema], required: true },
  },
  { _id: false }
);

const SpendTierSchema = new Schema(
  {
    minAmount: { type: Number, required: true, min: 0 },
    maxAmount: { type: Number, default: null }, // null = open-ended last tier
    pointsPerMAD: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const RangeConfigSchema = new Schema(
  {
    mode: { type: String, enum: ['range'], required: true },
    tiers: { type: [SpendTierSchema], required: true },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Enterprise schema
// Loyalty config is stored as Mixed — the three sub-schemas above are used
// only for documentation/reference. Structural validation is enforced in
// the service layer, which gives flexibility to add modes without migrations.
// ---------------------------------------------------------------------------

const EnterpriseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * Discriminated union — one of:
     *   { mode: 'linear',   pointsPerMAD, ... }
     *   { mode: 'category', defaultPointsPerMAD, rates: [...] }
     *   { mode: 'range',    tiers: [...] }
     */
    loyaltyConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'enterprises',
  }
);

EnterpriseSchema.index({ isActive: 1 });

const EnterpriseModel = mongoose.model('Enterprise', EnterpriseSchema);

module.exports = { EnterpriseModel };
