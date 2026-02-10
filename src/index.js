require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/app.config');
const { connectDB } = require('./config/database.config');
const { userRoutes, meetingRoutes, authRoutes } = require('./modules/meeting');
const errorHandler = require('./middlewares/error.middleware');
const { rateLimiter, authRateLimiter } = require('./middlewares/rateLimit.middleware');
const logger = require('./utils/logger.util');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', rateLimiter);
app.use('/api/auth/login', authRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Meeting Scheduler API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            users: '/api/users',
            meetings: '/api/meetings',
            auth: '/api/auth'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database synchronization and server startup
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        app.listen(config.port, () => {
            logger.info(`✓ Server is running on port ${config.port}`);
            logger.info(`✓ Environment: ${config.nodeEnv}`);
            logger.info(`✓ Access the API at: http://localhost:${config.port}`);
        });
    } catch (error) {
        logger.error(`✗ Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

startServer();

module.exports = app;
