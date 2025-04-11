import {useState, useContext} from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import {Navigate} from 'react-router-dom';


function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [registerError, setRegisterError] = useState(false);

    const user = useContext(UserContext);

    function registerUser(e) {
        e.preventDefault();
        
        // Reset error state
        setRegisterError(false);

        const data = {email, password, username}
        axios.post('http://localhost:4000/register', data, {withCredentials:true})
        .then(response => {
            user.setEmail(response.data.email);
            setEmail('');
            setPassword('');
            setUsername('');
            setRedirect(true);
        })
        .catch(error => {
            console.log("Registration error:", error);
            setRegisterError(true);
        });
    }

    if (redirect) {
        return <Navigate to={'/'} replace={true} />
    }

    return (
        <form action="" onSubmit={e => registerUser(e)}>
            {registerError && (
                <div style={{
                    color: 'white',
                    backgroundColor: 'red',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    REGISTRATION ERROR: EMAIL MAY ALREADY BE IN USE
                </div>
            )}
            <input 
                type="text" 
                placeholder="username..." 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required
            /><br />
            <input 
                type="email" 
                placeholder="email..." 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
            /><br />
            <input 
                type="password" 
                placeholder="password..." 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
            /><br />
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;