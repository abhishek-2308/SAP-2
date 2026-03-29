require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cardRoutes');
const authRoutes = require('./routes/authRoutes');
const cardDetailRoutes = require('./routes/cardDetailRoutes');
const cardAttachmentRoutes = require('./routes/cardAttachmentRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Global Rate Limiter: mitigate DDOS / brute bulk inserts
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 300, // limit each IP to 300 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// ─── Swagger Docs ─────────────────────────────────────────────
// Available at: GET /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Trello Cello API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1d2125; }',
}));

// Expose raw OpenAPI JSON for external tooling (Postman, etc.)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── API Routes (Protected by JWT Auth) ──────────────────────────
// Applying the JWT middleware. The middleware currently uses a soft-fallback 
// for frontend compatibility, but officially establishes the authorization network layer.
app.use('/auth', authRoutes);
app.use(authMiddleware);

app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);
app.use('/card-details', cardDetailRoutes);
app.use('/attachments', cardAttachmentRoutes);

// Static for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend:  http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
