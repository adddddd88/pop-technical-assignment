const { Router } = require('express');
const { AuthController } = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { LoginSchema } = require('./auth.schema.zod');

const router = Router();
const authController = new AuthController();

router.post('/login', validate(LoginSchema), authController.login);

router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
