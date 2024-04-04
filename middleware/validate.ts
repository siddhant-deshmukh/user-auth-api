import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

const validate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return next()
    }
    return res.status(400).json({ errors: result.array(), msg : 'incoorect input fields' });
  } catch (err) {
    return res.status(403).json({ err: "A token is required for authentication", user: null });
  }
  
};

export default validate;