import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {useState, useEffect} from 'react';
import axios from 'axios';
import Register from "./Register";
import UserContext from "./UserContext";
import Login from "./Login";
import Button from '@mui/material/Button';
import Home from './Home.js'


function App() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/user', {withCredentials:true})
    .then(response => {
      setEmail(response.data.email);
    })
    .catch(error => {
      // Clear email state on auth errors (401, 403) or server errors (500)
      if (error.response && [401, 403, 500].includes(error.response.status)) {
        setEmail('');
        console.log('Authentication error:', error.response.data.message || 'Session expired');
      } else {
        console.error('Error fetching user data:', error);
      }
    });
  }, []);

  function logout() {
    axios.post('http://localhost:4000/logout', {}, {withCredentials:true})
    .then(() => setEmail(''))
  }

  return (
    <UserContext.Provider value={{email, setEmail}}>
      <BrowserRouter>
      <nav>
        <Link to={'/'}>Homepage</Link>
        {!email && (
          <>
            <Link to={'/login'}>Login</Link>
            <Link to={'/register'}>Register</Link>
          </>
        )}
        {!!email && (
          <a onClick={e => {e.preventDefault();logout()}}>Logout</a>
        )}

      </nav>
      <main>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </main>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
