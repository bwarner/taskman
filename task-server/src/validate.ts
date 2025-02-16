import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// Middleware for validating request data
const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Incoming Body:', req.body); // Debugging log

      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        console.error('Validation Error:', result.error.format()); // Debugging log
        res.status(400).json({
          message: 'Validation failed',
          errors: result.error.format(),
        });
        return;
      }

      req.body = result.data; // Override with validated data
      next();
    } catch (error) {
      console.error('Unexpected Error:', error);
      res.status(500).json({
        message: 'Internal server error during validation',
      });
    }
  };

export default validate;
