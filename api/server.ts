import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from './models/User';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TopologyDescription } from 'mongodb';
import Todo from './models/todo';

// Define JWT user payload interface
interface UserPayload extends JwtPayload {
  id: string;
  email?: string;
}

const secret = 'secret123'

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/auth-todo');
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
type ResBody = { message?: string; id?: string; email?: string; username?: string };
type ReqQuery = {};
type Locals = { user?: string };

app.get(
  '/',
  (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
    res.json({message: 'ok'})
  });

  
app.get('/api/user', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as { id: string };
    User.findById(payload.id)
      .then(userInfo => {
        if (!userInfo) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ 
          id: (userInfo._id as any).toString(),
          email: userInfo.email,
          username: userInfo.username
        });
      })
      .catch(err => {
        console.error('Error finding user:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (err) {
    // this catches JWT verification errors giving me trouble
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});


app.post('/api/register', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const { email, password, username } = req.body;
  
  // validate request
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Email, password and username are required' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ password: hashedPassword, email, username });
  
  user.save()
    .then(userInfo => {
      jwt.sign({ id: userInfo._id, email: userInfo.email }, secret, 
        (err: Error | null, token: string | undefined) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error generating token' });
          } else {
            res.cookie('token', token).json({
              id: (userInfo._id as any).toString(), 
              email: userInfo.email,
              username: userInfo.username
            });
          }
        });
    })
    .catch(err => {
      console.error('Registration error:', err);
      if (err.code === 11000) { 
        res.status(409).json({ message: 'Email already in use' });
      } else {
        res.status(500).json({ message: 'Error creating user' });
      }
    });
});

app.post('/api/login', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  const {email, password} = req.body;
  User.findOne({email})
    .then(userInfo => {
      if (!userInfo) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      //check for null user info
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
                email: userInfo.email,
                username: userInfo.username
              });
            }
          }
        );
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
});

app.post('/api/logout', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  res.cookie('token', '').send();
});




  app.get('/api/tasks', (req: Request<Params, ResBody, any, ReqQuery>, res: Response) => {
    try {
      // check for token
      if (!req.cookies.token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
      Todo.where({user: new mongoose.Types.ObjectId(payload.id)})
        .find()
        .then((todos) => {
          res.json(todos);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        });
    } catch (err) {
      console.error('JWT verification error:', err);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });



app.post('/api/tasks', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
    const todo = new Todo({
      text: req.body.text,
      done: false,
      user: new mongoose.Types.ObjectId(payload.id),
    });
    
    todo.save()
      .then(todo => {
        res.json(todo);
      })
      .catch(err => {
        console.error('Error saving todo:', err);
        res.status(500).json({ message: 'Error saving todo' });
      });
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// update a todo
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
    const { id } = req.params;
    const { text, done } = req.body;
    
    const updateData: {text?: string; done?: boolean} = {};
    if (text !== undefined) updateData.text = text;
    if (done !== undefined) updateData.done = done;
    
    Todo.findOneAndUpdate(
      { _id: id, user: new mongoose.Types.ObjectId(payload.id) },
      updateData,
      { new: true } 
    )
      .then(updatedTodo => {
        if (!updatedTodo) {
          return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        res.json(updatedTodo);
      })
      .catch(err => {
        console.error('Error updating todo:', err);
        res.status(500).json({ message: 'Error updating todo' });
      });
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
    const { id } = req.params;
    
    Todo.findOneAndDelete({ _id: id, user: new mongoose.Types.ObjectId(payload.id) })
      .then(deletedTodo => {
        if (!deletedTodo) {
          return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        res.json({ message: 'Todo deleted successfully' });
      })
      .catch(err => {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: 'Error deleting todo' });
      });
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

