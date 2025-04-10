import {useState, useContext} from 'react';
import axios from 'axios';
import UserContext from "./UserContext";


function Login() {

    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');

    const user = useContext(UserContext);

    function loginUser(e) {
        e.preventDefault();

        const data = {email, password}
        axios.post('http://localhost:4000/login', data, {withCredentials:true})
        .then(response => {
            user.setEmail(response.data.email);
        });
    }

    return (
        <form action="" onSubmit={e => loginUser(e)}>
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