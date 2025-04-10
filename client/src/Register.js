import {useState} from 'react';
import axios from 'axios';

function Register() {

    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');

    function registerUser(e) {
        e.preventDefault();


        const data = {email, password}
        axios.post('http://localhost:4000/register', data, {withCredentials:true})


    }


    return (
        <form action="" onSubmit={e => registerUser(e)}>
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
            <button type="submit">register</button>
        </form>
    );
}

export default Register;