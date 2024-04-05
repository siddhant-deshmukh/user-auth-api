import mongoose, { Types } from "mongoose";

export interface IUserCreate {
  name: string
  email: string
  password: string
}
export interface IUser extends IUserCreate {
  _id: Types.ObjectId,
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true, maxLength: 50, minlength: 3 },
  name: { type: String, required: true, maxLength: 50, minlength: 1 },
  password: { type: String, required: true, maxLength: 100, minlength: 5 },
})

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - _id
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
 *         _id:
 *           type: string
 *           description: unique mongoose objectId of user document
 *       example:
 *         email: meow@meow.com
 *         name: Duggu
 *         _id: 660e71180213889760402d47
 *     
 */

const User = mongoose.model<IUser>("User", userSchema);
export default User;