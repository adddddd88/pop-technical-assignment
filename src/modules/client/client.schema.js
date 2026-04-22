const mongoose = require('mongoose');

const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Client — the person (identity)
// ---------------------------------------------------------------------------
const ClientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    collection: 'clients',
  }
);

// ---------------------------------------------------------------------------
// ClientEnterprise — loyalty account (link between client and enterprise)
// ---------------------------------------------------------------------------
const ClientEnterpriseSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    enterpriseId: {
      type: Schema.Types.ObjectId,
      ref: 'Enterprise',
      required: true,
    },
    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'client_enterprises',
  }
);

// One loyalty account per (client, enterprise) pair
ClientEnterpriseSchema.index({ clientId: 1, enterpriseId: 1 }, { unique: true });

const ClientModel = mongoose.model('Client', ClientSchema);
const ClientEnterpriseModel = mongoose.model('ClientEnterprise', ClientEnterpriseSchema);

module.exports = { ClientModel, ClientEnterpriseModel };