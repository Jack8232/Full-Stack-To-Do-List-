import {useContext, useState, useEffect} from "react";
import UserContext from "./UserContext";
import axios from 'axios';


function Home() {
    const userInfo = useContext(UserContext);
    const [inputVal, setInputVal] = useState('');
    const [todo, setTodos] = useState([]);

    useEffect(() => {
        if (userInfo.email) {
            axios.get('http://localhost:4000/todos', {withCredentials:true})
                .then(response => {
                    setTodos(response.data);
                })
                .catch(error => {
                    console.error('Error fetching todos:', error);
                });
        }
    }, [userInfo.email]);


    if (!userInfo.email){
        return "You need to be logged in to access your tasks"
    }
    function addTodo(e){
        e.preventDefault();
        if (inputVal.trim() === '') return; // Don't add empty todos
        
        axios.put('http://localhost:4000/todos', {text:inputVal}, {withCredentials:true})
        .then(response => {
            // Add the new todo from the server response (includes _id and other fields)
            setTodos([...todo, response.data]);
            setInputVal('');
        })
        .catch(error => {
            console.error('Error adding todo:', error);
        });
    }
    function toggleTodo(index) {
        const newTodos = [...todo];
        const todoItem = newTodos[index];
        const newDoneStatus = !todoItem.done;

        // First update the UI optimistically
        newTodos[index].done = newDoneStatus;
        setTodos(newTodos);

        // Then update on the server
        axios.patch(`http://localhost:4000/todos/${todoItem._id}`, {
            done: newDoneStatus
        }, {withCredentials: true})
        .catch(error => {
            console.error('Error updating todo:', error);
            // Revert the optimistic update if the server request fails
            newTodos[index].done = !newDoneStatus;
            setTodos([...newTodos]);
        });
    }
    return <div>
        <form onSubmit={e => {addTodo(e)}}>
            <input placeholder={'What would you like to do?'} 
            value={inputVal} 
            onChange={e => setInputVal(e.target.value)}/>

        </form>
        <ul>
            {todo.map((todoItem, index) => (
                <li key={index}>
                    <input 
                        type={'checkbox'} 
                        checked={todoItem.done}
                        onChange={() => toggleTodo(index)}
                    />
                    {todoItem.text}
                </li>
            ))}
        </ul>
    </div>
}

export default Home