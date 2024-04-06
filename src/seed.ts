import dotenv from 'dotenv';
import mongoose from "mongoose"
import { faker } from '@faker-js/faker';
import User, { IUserCreate } from './models/users';

dotenv.config();

async function main(){
  await User.deleteMany({})

  for (let i = 0; i < 10; i++) {
    const user: IUserCreate = {
      email: faker.internet.email(),
      name: faker.internet.displayName(),
      password: faker.internet.password(),
    }
    await User.create({ ...user })
    console.log(i, ". Created user", user)
  }
}

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then((mong) => { 
    console.log("Connected to database", mong.connection.id) 
    main()
  })
  .catch((err) => { console.error("Unable to connect database", err) })


