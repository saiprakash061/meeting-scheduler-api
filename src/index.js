require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/app.config');
const { connectDB } = require('./config/database.config');
const { userRoutes, meetingRoutes, authRoutes } = require('./modules/meeting/index');
const errorHandler = require('./middlewares/error.middleware');
const { rateLimiter } = require('./middlewares/rateLimit.middleware');
const logger = require('./utils/logger.util');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/', rateLimiter);

app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

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

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
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

startServer();

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
