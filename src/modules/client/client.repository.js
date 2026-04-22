const { ClientModel, ClientEnterpriseModel } = require('./client.schema');

class ClientRepository {
  /**
   * Find client by MongoDB _id
   * @param {string} clientId - MongoDB ObjectId string
   */
  async findById(clientId) {
    return ClientModel.findById(clientId).exec();
  }

  /**
   * Ensure a loyalty account exists for this (client, enterprise) pair.
   * Uses upsert so concurrent calls don't create duplicates.
   * @param {string} clientId  - MongoDB ObjectId string
   * @param {string} enterpriseId - MongoDB ObjectId string
   */
  async findOrCreateLoyaltyAccount(clientId, enterpriseId) {
    return ClientEnterpriseModel.findOneAndUpdate(
      { clientId, enterpriseId },
      { $setOnInsert: { clientId, enterpriseId, pointsBalance: 0 } },
      { upsert: true, new: true }
    ).exec();
  }

  /**
   * Atomically increment points — safe under any concurrency level.
   * @param {string} clientId
   * @param {string} enterpriseId
   * @param {number} points
   */
  async incrementPoints(clientId, enterpriseId, points) {
    return ClientEnterpriseModel.findOneAndUpdate(
      { clientId, enterpriseId },
      { $inc: { pointsBalance: points } },
      { new: true }
    ).exec();
  }

  /**
   * Get loyalty account with client info populated
   * @param {string} clientId
   * @param {string} enterpriseId
   */
  async getLoyaltyAccount(clientId, enterpriseId) {
    return ClientEnterpriseModel
      .findOne({ clientId, enterpriseId })
      .populate('clientId', 'name phone email')
      .exec();
  }
}

module.exports = { ClientRepository };