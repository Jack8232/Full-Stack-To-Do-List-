import logo from './logo.svg';
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
  const [username, setUsername] = useState('');

  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(200, 200, 200)';
    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    
    axios.get('http://localhost:4000/api/user', {withCredentials:true})
    .then(response => {
      console.log("User data from server:", response.data);
      setEmail(response.data.email);
      setUsername(response.data.username || '');
      console.log("Username set to:", response.data.username);
    })
    .catch(error => {
      if (error.response && [401, 403, 500].includes(error.response.status)) {
        setEmail('');
        setUsername('');
        console.log('Authentication error:', error.response.data.message || 'Session expired');
      } else {
        console.error('Error fetching user data:', error);
      }
    });
  }, []);

  function logout() {
    axios.post('http://localhost:4000/api/logout', {}, {withCredentials:true})
    .then(() => {
      setEmail('');
      setUsername('');
    })
  }

  console.log("App render - Current user context:", { email, username });

  return (
    <UserContext.Provider value={{email, setEmail, username, setUsername}}>
      <BrowserRouter>
        <nav style={{
          textAlign: 'center',
          padding: '10px 0'
        }}>
          <Link to={'/'} style={{
            display: 'inline-block',
            padding: '10px 15px',
            textDecoration: 'none',
            color: '#333',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            margin: '0 5px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => e.target.style.backgroundColor = '#e0e0e0'}
          onMouseOut={e => e.target.style.backgroundColor = '#f0f0f0'}>Tasks</Link>
          {!email && (
            <>
              <Link to={'/login'} style={{
                display: 'inline-block',
                padding: '10px 15px',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                margin: '0 5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#e0e0e0'}
              onMouseOut={e => e.target.style.backgroundColor = '#f0f0f0'}>Login</Link>
              <Link to={'/register'} style={{
                display: 'inline-block',
                padding: '10px 15px',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                margin: '0 5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#e0e0e0'}
              onMouseOut={e => e.target.style.backgroundColor = '#f0f0f0'}>Register</Link>
            </>
          )}
          {!!email && (
            <a onClick={e => {e.preventDefault();logout()}} style={{
              display: 'inline-block',
              padding: '10px 15px',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              margin: '0 5px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#e0e0e0'}
            onMouseOut={e => e.target.style.backgroundColor = '#f0f0f0'}>Logout</a>
          )}
        </nav>
        <main style={{
          width: '500px',
          margin: '10px auto',
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '5px',
          boxShadow: '0 2px 2px rgba(0,0,0,.1)'
        }}>
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
