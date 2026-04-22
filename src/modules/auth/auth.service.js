const jwt = require('jsonwebtoken');
const { EnterpriseRepository } = require('../enterprise/enterprise.repository');
const { AuthRepository } = require('./auth.repository');
const { logger } = require('../../utils/logger');

// Token lives for 24 hours — adjust as needed
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

class AuthService {
  constructor() {
    this.enterpriseRepository = new EnterpriseRepository();
    this.authRepository = new AuthRepository();
  }

  /**
   * Validate enterprise exists, sign a JWT, store it in Redis.
   * Any previously issued token for this enterprise is overwritten.
   *
   * @param {string} enterpriseId
   * @returns {Promise<{ token: string, expiresIn: number }>}
   */
  async login(enterpriseId) {
    const enterprise = await this.enterpriseRepository.findActiveById(enterpriseId);

    if (!enterprise) {
      const err = new Error('Enterprise not found or inactive');
      err.code = 'ENTERPRISE_NOT_FOUND';
      throw err;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const payload = { enterpriseId: enterprise._id.toString() };

    const token = jwt.sign(payload, secret, {
      expiresIn: TOKEN_TTL_SECONDS,
      issuer: 'popcard-api',
    });

    // Store in Redis — TTL matches JWT exp exactly
    await this.authRepository.saveToken(
      enterprise._id.toString(),
      token,
      TOKEN_TTL_SECONDS
    );

    logger.info('Enterprise logged in', { enterpriseId });

    return { token, expiresIn: TOKEN_TTL_SECONDS };
  }

  /**
   * Delete token from Redis immediately.
   * JWT signature is still technically valid but will fail the Redis check.
   *
   * @param {string} enterpriseId
   */
  async logout(enterpriseId) {
    await this.authRepository.deleteToken(enterpriseId);
    logger.info('Enterprise logged out', { enterpriseId });
  }
}

module.exports = { AuthService };
