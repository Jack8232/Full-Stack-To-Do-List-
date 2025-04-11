import {useState, useContext} from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import {Navigate} from 'react-router-dom';



function Login() {

    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [redirect, setRedirect] = useState(false);
    

    const user = useContext(UserContext);

    function loginUser(e) {
        e.preventDefault();

        const data = {email, password}
        axios.post('http://localhost:4000/login', data, {withCredentials:true})
        .then(response => {
            user.setEmail(response.data.email);
            user.setUsername(response.data.username);
            setEmail('');
            setPassword('');
            setRedirect(true);
        })
        .catch(error => {
            console.log("Login error:", error);
            setLoginError(true);
        });
    }

if (redirect) {
    return <Navigate to={'/'} replace={true} />
}

    return (
        <form action="" onSubmit={e => loginUser(e)}>
            {loginError && (
                <div style={{
                    color: 'white',
                    backgroundColor: 'red',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    LOGIN ERROR: WRONG EMAIL OR PASSWORD
                </div>
            )}
            <input 
            type="email" 
            placeholder="email..." 
            value = {email} 
            onChange={e => setEmail(e.target.value)}
            /><br />
            <input type="password" 
            placeholder="password..." 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            /><br />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;