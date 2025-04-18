import {useContext, useState, useEffect} from "react";
import UserContext from "./UserContext";
import axios from 'axios';
import { Typography } from '@mui/material';

function Home() {
    const userInfo = useContext(UserContext);
    console.log("UserInfo in Home component:", userInfo); // debug log
    
    const [inputVal, setInputVal] = useState('');
    const [todo, setTodos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    
    const username = userInfo.username;
    console.log("Username value:", username);

    useEffect(() => {
        if (userInfo.email) {
            axios.get('http://localhost:4000/api/tasks', {withCredentials:true})
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
        if (inputVal.trim() === '') return; // don't add empty todos
        
        axios.post('http://localhost:4000/api/tasks', {text:inputVal}, {withCredentials:true})
        .then(response => {
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

        newTodos[index].done = newDoneStatus;
        setTodos(newTodos);

        axios.put(`http://localhost:4000/api/tasks/${todoItem._id}`, {
            done: newDoneStatus
        }, {withCredentials: true})
        .catch(error => {
            console.error('Error updating todo:', error);
            newTodos[index].done = !newDoneStatus;
            setTodos([...newTodos]);
        });
    }

    function startEditing(todoItem) {
        setEditingId(todoItem._id);
        setEditText(todoItem.text);
    }

    function cancelEditing() {
        setEditingId(null);
        setEditText('');
    }

    function saveEdit(todoItem) {
        if (editText.trim() === '') return;
        
        const newTodos = todo.map(item => 
            item._id === todoItem._id ? {...item, text: editText} : item
        );
        setTodos(newTodos);
        
        axios.put(`http://localhost:4000/api/tasks/${todoItem._id}`, {
            text: editText
        }, {withCredentials: true})
        .then(() => {
            setEditingId(null);
            setEditText('');
        })
        .catch(error => {
            console.error('Error updating todo text:', error);
            setTodos(todo);
        });
    }

    function deleteTodo(todoItem) {
        const newTodos = todo.filter(item => item._id !== todoItem._id);
        setTodos(newTodos);
        
        axios.delete(`http://localhost:4000/api/tasks/${todoItem._id}`, {withCredentials: true})
        .catch(error => {
            console.error('Error deleting todo:', error);
            setTodos(todo);
        });
    }

    return <div>
        <form onSubmit={e => {addTodo(e)}}>
            <div style={{fontSize: '24px', color: '#3f51b5', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold'}}>
                {username ? `${username}'s Todo List` : 'My Todo List'}
            </div>
            <input 
                placeholder={'Add Task...'} 
                value={inputVal} 
                onChange={e => setInputVal(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '15px',
                    boxSizing: 'border-box'
                }}
            />
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {todo.map((todoItem, index) => (
                <li key={todoItem._id || index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    margin: '8px 0',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <div style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                            type={'checkbox'} 
                            checked={todoItem.done}
                            onChange={() => toggleTodo(index)}
                        />
                    </div>
                    
                    {editingId === todoItem._id ? (
                        <>
                            <div style={{ flex: 1 }}>
                                <input 
                                    type="text" 
                                    value={editText} 
                                    onChange={e => setEditText(e.target.value)} 
                                    autoFocus
                                    style={{ width: '100%', padding: '4px' }}
                                />
                            </div>
                            <div style={{ width: '120px', textAlign: 'right' }}>
                                <button onClick={() => saveEdit(todoItem)} style={{ marginRight: '5px' }}>Save</button>
                                <button onClick={cancelEditing}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ 
                                flex: 1, 
                                textDecoration: todoItem.done ? 'line-through' : 'none',
                                padding: '0 10px',
                                textAlign: 'left'
                            }}>
                                {todoItem.text}
                            </div>
                            <div style={{ width: '120px', textAlign: 'right' }}>
                                <button onClick={() => startEditing(todoItem)} style={{ marginRight: '5px' }}>Edit</button>
                                <button onClick={() => deleteTodo(todoItem)}>Delete</button>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    </div>
}

export default Home