const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "Customer not exists." })
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some(user => user.username === username)

  if (usernameExists) {
    return response.status(400).json({ error: 'User already exists.'});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });
  return response.status(201).json(users[users.length -1]);

});

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  users.forEach(elem => {
    if (elem.username === user.username) {
      elem.todos.push({
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
      })

      return response.status(201).json(elem.todos[elem.todos.length - 1]);
    }
  })

});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;
  const { user } = request;

  const todoExists = user.todos.find(todo => todo.id === id)

  if (!todoExists) {
    return response.status(404).json({error: 'Todo doesnt exists.'})
  }

  users.forEach(elem => {
    if (elem.username === user.username) {
      elem.todos.forEach(todo => {
        if (todo.id === id) {
          todo.title = title
          todo.deadline = deadline
        }
      })
      return response.status(201).json(elem.todos[elem.todos.length - 1]);
    }
  })

});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const { user } = request;

  const idExists = user.todos.find(todo => todo.id === id);

  if (!idExists) {
    return response.status(404).json({error: 'id doesnt exists.'});
  }

  users.forEach(elem => {
    if (user.username === elem.username) {
      elem.todos.forEach(todo => {
        if (todo.id === id) {
          todo.done = true;
        }
        return response.status(201).json(todo);
      })
    }
  })

});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const { user } = request;

  users.forEach(elem => {
    if (elem.username === user.username) {
      elem.todos.forEach(task => {
        if (task.id === id) {
          user.todos.splice(id, 1);
          return response.status(204).send();
        }
      })
    }
  })
  return response.status(404).json({error: 'Task is not exists.'});

});

module.exports = app;