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
type ResBody = { message?: string; id?: string; email?: string };
type ReqQuery = {};
// Locals can be defined but not passed directly to Response unless customized
type Locals = { user?: string };

app.get(
  '/',
  (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
    res.json({message: 'ok'})
  });

  //save cookie and token information for page refresh
  //if page is refreshed the user is logged out
app.get('/user', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const payload = jwt.verify(req.cookies.token, secret) as { id: string };
  User.findById(payload.id)
    .then(userInfo => {
      if (!userInfo) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ 
        id: (userInfo._id as any).toString(),
        email: userInfo.email
      });
    })
});


app.post('/register', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({password: hashedPassword, email})
  user.save().then(userInfo => {
    jwt.sign({id:userInfo._id, email:userInfo.email}, secret, (err: Error | null, token: string | undefined) => {
      if (err) {
        console.log(err)
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({id: (userInfo._id as any).toString(), email: userInfo.email});
      }
    });
    
  });
});

app.post('/login', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const {email, password} = req.body;
  User.findOne({email})
    .then(userInfo => {
      if (!userInfo) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // We've checked userInfo is not null above, so we're safe to use it
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        jwt.sign(
          {id: userInfo._id, email}, 
          secret, 
          (err: Error | null, token: string | undefined) => {
            if (err) {
              console.log(err);
              res.status(500).json({ message: 'Error generating token' });
            } else {
              res.cookie('token', token).json({
                id: (userInfo._id as any).toString(), 
                email: userInfo.email
              });
            }
          }
        );
      } else {
        res.status(401);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
});

app.post('/logout', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  res.cookie('token', '').send();
});



app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

