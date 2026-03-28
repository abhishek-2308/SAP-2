const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trello Cello API',
      version: '1.0.0',
      description: 'Production-grade Kanban board REST API — intent-based design',
      contact: { name: 'Trello Cello Team' },
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Local Development' },
      { url: process.env.RENDER_BACKEND_URL || 'https://your-app.onrender.com', description: 'Production (Render)' },
    ],
    components: {
      schemas: {
        Board: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Product Roadmap' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        List: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            board_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'In Progress' },
            position: { type: 'number', format: 'float', example: 2.0 },
          },
        },
        Card: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            list_id: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'Implement Drag & Drop' },
            description: { type: 'string', example: 'Use dnd-kit with optimistic updates' },
            position: { type: 'number', format: 'float', example: 1.5 },
            due_date: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Resource not found' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],  // JSDoc annotations live inside route files
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
