import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from './models/User';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const secret = 'secret123'

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/auth');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
};

connectToDatabase();

const db = mongoose.connection;
db.on('error', console.log);

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors ({
  credentials:true,
  origin: 'http://localhost:3000',
}));

type Params = {};
type ResBody = { message: string };
type ReqQuery = {};
// Locals can be defined but not passed directly to Response unless customized
type Locals = { user?: string };

app.get(
  '/',
  (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
    res.json({message: 'ok'})
  });

app.post('/register', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({password: hashedPassword, email})
  user.save().then(userInfo => {
    jwt.sign({id:userInfo._id, email:userInfo.email}, })
    
  });
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
