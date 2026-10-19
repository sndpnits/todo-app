const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Todo = require('./models/Todo');

const app = express();

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/todo-app')
  .then(() => console.log('Connected to local MongoDB database'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

// 1. Get tasks for a specific day
app.get('/api/todos', async (req, res) => {
  try {
    const dateParam = req.query.date || new Date().toISOString().split('T')[0];
    
    // Calculate start and end of the requested day
    const startOfDay = new Date(dateParam);
    const endOfDay = new Date(dateParam);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todos = await Todo.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ _id: -1 }); // Newest first

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a new task
app.post('/api/todos', async (req, res) => {
  try {
    const { title, date } = req.body;
    const newTodo = new Todo({
      title,
      date: new Date(date || new Date())
    });
    
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Mark task as completed or incomplete
app.put('/api/todos/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    await todo.save();
    
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Move a task to the next day
app.put('/api/todos/:id/move', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    const nextDay = new Date(todo.date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    todo.date = nextDay;
    todo.completed = false; // Usually, moved tasks are considered pending
    await todo.save();

    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
