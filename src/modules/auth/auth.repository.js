const { getRedisClient } = require('../../utils/redis');

// Key pattern: auth:token:<enterpriseId>
// Stores the raw JWT string — exact match required on every request
const tokenKey = (enterpriseId) => `auth:token:${enterpriseId}`;

class AuthRepository {
  /**
   * Store the token in Redis with a TTL matching the JWT expiry.
   * Only ONE token per enterprise at a time — SET overwrites any previous token.
   * Calling login() again instantly invalidates the old session.
   *
   * @param {string} enterpriseId
   * @param {string} token - raw JWT string
   * @param {number} ttlSeconds - must match JWT exp claim
   */
  async saveToken(enterpriseId, token, ttlSeconds) {
    const redis = getRedisClient();
    await redis.set(tokenKey(enterpriseId), token, 'EX', ttlSeconds);
  }

  /**
   * Retrieve the stored token for an enterprise.
   * Returns null if expired (Redis TTL auto-deleted it) or never issued.
   *
   * @param {string} enterpriseId
   * @returns {Promise<string|null>}
   */
  async getToken(enterpriseId) {
    const redis = getRedisClient();
    return redis.get(tokenKey(enterpriseId));
  }

  /**
   * Delete the token — immediate logout.
   * The JWT signature may still be valid but the token is gone from Redis,
   * so the middleware will reject it.
   *
   * @param {string} enterpriseId
   */
  async deleteToken(enterpriseId) {
    const redis = getRedisClient();
    await redis.del(tokenKey(enterpriseId));
  }
}

module.exports = { AuthRepository };
