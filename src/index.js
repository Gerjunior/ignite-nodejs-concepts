const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkIfUserAccountExists(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).send('User not found')
  }

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username)

  if (userExists) {
    return response.status(400).json({ error: 'This username already exists.'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checkIfUserAccountExists, (request, response) => {
  const { username } = request.headers

  const { todos } = users.find(user => user.username === username)

  return response.json(todos)
});

app.post('/todos', checkIfUserAccountExists, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  const userIndex = users.findIndex(user => user.username === username)

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checkIfUserAccountExists, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  const todo = users[userIndex].todos[todoIndex]

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'})
  }

  const updatedTodo = { ...todo, title, deadline }

  users[userIndex].todos[todoIndex] = updatedTodo

  return response.status(200).json(updatedTodo)
});

app.patch('/todos/:id/done', checkIfUserAccountExists, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);  

  const todo = users[userIndex].todos[todoIndex]

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'})
  }

  users[userIndex].todos[todoIndex].done = true

  return response.status(201).json(users[userIndex].todos[todoIndex])
});

app.delete('/todos/:id', checkIfUserAccountExists, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);  

  const todo = users[userIndex].todos[todoIndex]

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  users[userIndex].todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;