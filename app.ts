import cors from 'cors'
import dotenv from 'dotenv';
import mongoose from "mongoose"
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import swaggerUi from "swagger-ui-express"

import userRouter from './routes/users'
import { specs } from './swagger';

dotenv.config();


const app: Express = express();

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then((mong) => { console.log("Connected to database", mong.connection.id) })
  .catch((err) => { console.error("Unable to connect database", err) })

// parsing cokkie values
app.use(cookieParser())
// limit the size of incoming request body and parse i.e convert string json to js object for every incoming request
app.use(express.json({ limit: '20kb' }))
// limiting size of url
app.use(express.urlencoded({ extended: false, limit: '1kb' }));
// // setting up client origin
app.use(cors({ origin: [`${process.env.CLIENT_URL}`], credentials: true, optionsSuccessStatus: 200 }));


var options: swaggerUi.SwaggerUiOptions = {
  isExplorer: true,
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, options));

app.use('/', userRouter)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
export default app