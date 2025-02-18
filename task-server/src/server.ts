import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import taskman from './taskman.js';
import logger from './logger.js';
import { ZodError } from 'zod';

console.log('Starting server...');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/api', taskman);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err, 'Error in server');
  if (err instanceof ZodError) {
    const statusCode = 422;
    res.status(statusCode).json({
      error: err.errors.map((error: any) => error.message).join(', '),
    });
  } else if (err instanceof Error) {
    const statusCode = 500;
    res.status(statusCode).json({
      error: err.message,
    });
  } else {
    const statusCode = 500;
    res.status(statusCode).json({
      error: 'Internal server error',
    });
  }
  next(err);
});

app.listen(PORT, async () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
