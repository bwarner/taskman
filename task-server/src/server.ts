import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskman from './taskman.js';
import logger from './logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api', taskman);

app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
