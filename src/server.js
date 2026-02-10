require('dotenv').config();
const app = require('./app');
const config = require('./config/app.config');
const { connectDB } = require('./config/database.config');
const logger = require('./utils/logger.util');

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

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

startServer();
