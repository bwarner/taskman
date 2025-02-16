import { pino } from 'pino';

// Check if the app is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Define the logger with Pino
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
});
export default logger;
