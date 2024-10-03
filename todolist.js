const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming requests
app.use(bodyParser.json());

// File to store tasks
const TASKS_FILE = './tasks.json';

// Utility function to read tasks from the file
const readTasks = () => {
  if (fs.existsSync(TASKS_FILE)) {
    const data = fs.readFileSync(TASKS_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write tasks to the file
const writeTasks = (tasks) => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// Route to get all tasks
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// Route to add a new task
app.post('/tasks', (req, res) => {
  const tasks = readTasks();
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false,
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// Route to update an existing task
app.put('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].title = req.body.title || tasks[taskIndex].title;
    tasks[taskIndex].completed = req.body.completed !== undefined ? req.body.completed : tasks[taskIndex].completed;
    writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Route to delete a task
app.delete('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const updatedTasks = tasks.filter(task => task.id !== taskId);

  if (tasks.length !== updatedTasks.length) {
    writeTasks(updatedTasks);
    res.json({ message: "Task deleted" });
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Route to mark a task as completed
app.patch('/tasks/:id/completed', (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Route to mark a task as pending
app.patch('/tasks/:id/pending', (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = false;
    writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.listen(port, () => {
  console.log(`To-do API running on http://localhost:${port}`);
});
