import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    done: { type: mongoose.SchemaTypes.Boolean, required: true },
    user: { type: mongoose.SchemaTypes.ObjectId }
});

interface ITodo extends mongoose.Document {
    text: string;
    done: boolean;
    user: mongoose.Types.ObjectId;
}

const Todo = mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;