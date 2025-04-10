import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {useState, useEffect} from 'react';
import axios from 'axios';
import Register from "./Register";
import UserContext from "./UserContext";
import Login from "./Login";


function App() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/user', {withCredentials:true})
    .then(response => {
      setEmail(response.data.email);
    });
  }, []);

  return (
    <UserContext.Provider value={{email, setEmail}}>
      <div>
      <BrowserRouter>
      <div>
        {!!email && (
          <div>Logged in as {email}</div>
        )}
        {!email && (
          <div>Not logged in</div>
        )}

      </div>
      <hr/>
      <div>
        <Link to={'/'}>Home</Link> |  
        <Link to={'/login'}>Login</Link>|  
        <Link to={'/register'}>Register</Link>
      </div>
      <Routes>
        <Route path={'/register'} element={<Register />}/>
        <Route path={'/login'} element={<Login />}/>
      </Routes>
      <hr/>
      </BrowserRouter>
    </div>
    </UserContext.Provider>
  );
}

export default App;
