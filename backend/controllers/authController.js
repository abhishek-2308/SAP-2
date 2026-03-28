const AuthService = require('../services/authService');

const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const data = await AuthService.registerUser(name, email, password);
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err.status) res.status(err.status);
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.loginUser(email, password);
      res.status(200).json({ success: true, data });
    } catch (err) {
      if (err.status) res.status(err.status);
      next(err);
    }
  },
  
  async me(req, res, next) {
    // Requires authMiddleware to run first
    try {
      // User info is injected into req by our JWT middleware
      res.status(200).json({ success: true, data: { user: req.user } });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
