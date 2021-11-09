const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({ error: 'User not Found' })
  }

  request.user = user

  return next()
}

function verifyExistsId(request, response, next) {
  const { id } = request.params
  const { user } = request

  const verifyId = user.todos.find(todo => todo.id === id)

  if(!verifyId) {
    return response.status(404).json({ error: 'Todo Not Found' })
  }

  request.verifyId = verifyId

  return next()
}

app.post('/users',(request, response) => {
  const { name, username } = request.body

  const userExists = users.find(user => user.username === username)

  if(userExists) {
    return response.status(400).json({ error: 'Username Exists' })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, verifyExistsId,(request, response) => {
  const { title, deadline } = request.body
  const { verifyId } = request

  verifyId.title = title
  verifyId.deadline = new Date(deadline)

  return response.json(verifyId)
});

app.patch('/todos/:id/done', checksExistsUserAccount, verifyExistsId,(request, response) => {
  const { verifyId } = request

  verifyId.done = true

  return response.json(verifyId)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'Todo Not Found' })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;