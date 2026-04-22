const { AuthService } = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const COOKIE_NAME = 'access_token';

const cookieOptions = {
  httpOnly: true,  
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 1000, 
};

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req, res, next) {
    try {
      const { enterpriseId } = req.body;
      const result = await this.authService.login(enterpriseId);

      res.cookie(COOKIE_NAME, result.token, cookieOptions);

      return sendSuccess(res, { expiresIn: result.expiresIn });
    } catch (err) {
      if (err.code === 'ENTERPRISE_NOT_FOUND') {
        return sendError(res, err.code, err.message, 404);
      }
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await this.authService.logout(req.auth.enterpriseId);

      res.clearCookie(COOKIE_NAME, cookieOptions);

      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AuthController, COOKIE_NAME };