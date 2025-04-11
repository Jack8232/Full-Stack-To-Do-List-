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
  try {
    // Check if token exists
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
          email: userInfo.email
        });
      })
      .catch(err => {
        console.error('Error finding user:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (err) {
    // This catches JWT verification errors (invalid token, expired token, etc.)
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
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




  app.get('/todos', (req: Request<Params, ResBody, any, ReqQuery>, res: Response) => {
    try {
      // Check if token exists
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
      // This catches JWT verification errors (invalid token, expired token, etc.)
      console.error('JWT verification error:', err);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });



app.put('/todos', (req: Request<Params, ResBody, any, ReqQuery>, res: Response<ResBody>) => {
  try {
    // Check if token exists
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
    // This catches JWT verification errors (invalid token, expired token, etc.)
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Update a todo
app.patch('/todos/:id', (req: Request, res: Response) => {
  try {
    // Check if token exists
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
    const { id } = req.params;
    const { text, done } = req.body;
    
    // Update only fields that are provided
    const updateData: {text?: string; done?: boolean} = {};
    if (text !== undefined) updateData.text = text;
    if (done !== undefined) updateData.done = done;
    
    // Find and update the todo, ensuring it belongs to the authenticated user
    Todo.findOneAndUpdate(
      { _id: id, user: new mongoose.Types.ObjectId(payload.id) },
      updateData,
      { new: true } // Return the updated document
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

// Delete a todo
app.delete('/todos/:id', (req: Request, res: Response) => {
  try {
    // Check if token exists
    if (!req.cookies.token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const payload = jwt.verify(req.cookies.token, secret) as UserPayload;
    const { id } = req.params;
    
    // Find and delete the todo, ensuring it belongs to the authenticated user
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

