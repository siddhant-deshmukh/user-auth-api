import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from "express";
import User, { IUser, IUserCreate } from "../models/users";

export async function UserLogin(req: Request, res: Response) {
  try {
    const { email, password }: { email: string, password: string } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Bad request" })
    }

    const checkUser = await User.findOne({ email });

    if (!checkUser) return res.status(404).json({ msg: 'User doesn`t exists!' });


    if (!(await bcrypt.compare(password, checkUser.password))) return res.status(406).json({ msg: 'Wrong password!' });

    const token = jwt.sign({ _id: checkUser._id.toString(), email }, process.env.TOKEN_KEY || 'zhingalala', { expiresIn: '2h' })

    // Set-Cookie header
    // add an access_token cookie in the frontend will get validated to autherize some url
    res.cookie("access_token", token, {
      httpOnly: true,
      // sameSite: "none",
      // secure: true,
    })

    const user = {
      ...checkUser.toObject(),
      password: undefined
    }
    return res.status(200).json({ token, user })
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error", err })
  }
}

export async function UserRegister(req: Request, res: Response) {
  try {
    const { email, name, password }: IUserCreate = req.body;

    // console.log("Here is user register", email, name, password)
    if (!email || !name || !password) {
      return res.status(400).json({ msg: "Bad request" })
    }
    // console.log("About to check email")
    const checkEmail = await User.findOne({ email }).exec();
    // console.log("checkEmail", checkEmail)
    if (checkEmail) return res.status(409).json({ msg: 'User already exists!' });

    // this will do the hashing and encrupt the password before storing it in the database
    //@ts-ignore
    const encryptedPassword = await bcrypt.hash(password, 15)
    // console.log(password, encryptedPassword)
    const newUser = await User.create({
      email,
      name,
      password: encryptedPassword,
    })
    // console.log("new user", newUser.toObject())
    // in token mongodb object _id will be stored. After 2h token will expire 
    const token = jwt.sign({ _id: newUser._id.toString(), email }, process.env.TOKEN_KEY || 'zhingalala', { expiresIn: '2h' })

    // Set-Cookie header
    // add an access_token cookie in the frontend will get validated to autherize some url
    res.cookie("access_token", token, {
      httpOnly: true,
      // sameSite: "none",
      // secure: true,
    })

    const user = {
      ...newUser.toObject(),
      password: undefined
    }
    // console.log("And here is the user", user)
    return res.status(201).json({ token, user })
  } catch (err) {
    console.error("While register", err)
    return res.status(500).json({ msg: "Internal server error", err })
  }
}

export async function EditUser(req: Request, res: Response) {
  try {
    const { email, name, password }: IUserCreate = req.body;

    const user_id = res.user._id

    const user = await User.findById(user_id)
    if (!user)
      return res.status(404).json({ msg: "User not found" });
    // this will do the hashing and encrupt the password before storing it in the database

    const newuser: { email?: string, password?: string, name?: string } = {}

    if (password) {
      //@ts-ignore
      const encryptedPassword = await bcrypt.hash(password, 15)
      newuser.password = encryptedPassword
    }
    if (email) {
      newuser.email = email
    }
    if (name) {
      newuser.name = name
    }

    await User.findByIdAndUpdate(user_id, {
      ...newuser
    })

    return res.status(200).json({ msg: "Successful" })
  } catch (err) {
    //@ts-ignore
    if (err?.codeName === "DuplicateKey") {
      return res.status(409).json({ msg: "Invalid email" })
    }
    console.error("While edit", err)
    return res.status(500).json({ msg: "Internal server error", err })
  }
}