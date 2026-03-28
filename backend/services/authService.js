const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'trello-cello-super-secret';
const SALT_ROUNDS = 10;

const AuthService = {
  async registerUser(name, email, password) {
    if (!name || !email || !password) {
      throw { status: 400, message: 'Name, email, and password are required' };
    }

    // Checking if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'Email already registered' };
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });

    return { user, token };
  },

  async loginUser(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' };
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    // Don't send hash to client
    delete user.password_hash;
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });

    return { user, token };
  }
};

module.exports = AuthService;
