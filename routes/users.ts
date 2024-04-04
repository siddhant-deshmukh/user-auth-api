import dotenv from 'dotenv';
import { body } from 'express-validator';
import express, { NextFunction, Request, Response } from 'express'

import auth from '../middleware/auth'
import validate from '../middleware/validate';
import { UserLogin, UserRegister } from '../controller/user';


dotenv.config();
var router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User autherization and authentication related routes
 * /:
 *   get:
 *     summary: 
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succesfully authorized user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRes'
 *       401:
 *         description: Not authorized. Invalid request.
 *       403:
 *         description: Invalid token. Permission denied.
 *       500:
 *         description: Some internal server error
 * components:
 *   schemas:
 *     UserRes:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         user:
 *           email: meow@meow.com
 *           name: Duggu
 *           password: password
*/
router.get('/', auth, function (req: Request, res: Response, next: NextFunction) {
  return res.status(200).json({ user: res.user });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: 
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Succesfully created new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AfterAuthRes'
 *       400:
 *         description: Invalid email or password. Password length between 5 to 20. Name length between 1 to 50. Invalid email or length greater than 100.
 *       409:
 *         description: email already exist. Try login.
 *       500:
 *         description: Some internal server error
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: valid email of the user
 *         name:
 *           type: string
 *           description: name of the user
 *         password:
 *           type: string
 *           description: password of the user
 *       example:
 *         email: meow@meow.com
 *         name: Duggu
 *         password: password
 *     AfterAuthRes:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjBlNzExODAyMTM4ODk3NjA0MDJkNDciLCJlbWFpbCI6Im1lb3dAbWVvdy5jb20iLCJpYXQiOjE3MTIyMzg3MTgsImV4cCI6MTcxMjI0NTkxOH0.cMIhPC5FOTgyotY8lRdttG87bUqfSavcKM4FNS2V7oU
 *         user:
 *           email: meow@meow.com
 *           name: Duggu
 *           password: password
 * 
*/
router.post('/register',
  body('name').exists().isString().isLength({ max: 50, min: 1 }).trim(),
  body('password').exists().isString().isLength({ max: 20, min: 5 }).trim(),
  body('email').exists().isEmail().isLength({ max: 100, min: 3 }).toLowerCase().trim(),
  validate,
  UserRegister
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Succesfully login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AfterAuthRes'
 *       400:
 *         description: Invalid email or password. Password length between 5 to 20. Name length between 1 to 50. Invalid email or length greater than 100.
 *       404:
 *         description: email not found. Try register.
 *       406:
 *         description: Wrong password.
 *       500:
 *         description: Some internal server error
 * components:
 *   schemas:
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: valid email of the user
 *         password:
 *           type: string
 *           description: password of the user
 *       example:
 *         email: meow@meow.com
 *         password: password
 * 
*/
router.post('/login',
  body('password').exists().isString().isLength({ max: 20, min: 5 }).trim(),
  body('email').exists().isEmail().isLength({ max: 50, min: 3 }).toLowerCase().trim(),
  validate,
  UserLogin
);


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User autherization and authentication related routes
 * /logout:
 *   get:
 *     summary: 
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Remove the http only token from the cookie.
 *       500:
 *         description: Some internal server error
*/
router.get('/logout', async function (req: Request, res: Response, next: NextFunction) {
  try {
    res.cookie("access_token", null) // will set cookie to null
    return res.status(200).json({ msg: 'Sucessfull!' })
  } catch (err) {
    return res.status(500).json({ msg: 'Some internal error occured', err })
  }
})

export default router