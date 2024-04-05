import * as jwt from 'jsonwebtoken'
import User from '../models/users';
import { NextFunction, Request, Response } from 'express';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {

    let token: undefined | string;
    if (req.headers.authorization) {
      const bearer_token = req.headers.authorization
      // console.log(bearer_token)
      if (typeof bearer_token === 'string' && bearer_token.startsWith('Bearer ') && bearer_token.split(' ').length === 2) {
        token = bearer_token.split(' ')[1]
      }
    } else {
      token = req.cookies.access_token
    }

    // console.log(req.headers.authorization, req.cookies.access_token)
    // console.log("req.cookies.access_token",req.cookies.access_token,process.env.TOKEN_KEY || 'zhingalala');
    // console.log("Coming")
    if (!token) {
      return res.status(401).json({ err: "Not authorized!", user: null });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_KEY || 'zhingalala');
    if (typeof decoded === 'string' || !decoded._id) {
      res.clearCookie("access_token");
      return res.status(403).json({ err: "Something is wrong with verification!", user: null });
    }
    const user = await User.findById(decoded._id).select({ 'password': 0, 'auth_type': 0 });
    if (!user) {
      res.clearCookie("access_token");
      return res.status(403).json({ err: "A token is required for authentication", user: null });
    }

    res.user = user;
  } catch (err) {
    return res.status(403).json({ err: "A token is required for authentication", user: null });
  }
  return next();
};

export default verifyToken;