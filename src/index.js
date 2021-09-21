const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)
  if (!user) {
    return response.status(400).json({ error: "Customer not found." })
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  users.forEach(elem => {
    if (elem.username === username) {
      elem.todos.push({
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
      })
      return response.status(200).json(elem.todos);
    }
  })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const id = request.params.id;

  users.forEach(user => {
    if (user.username === username) {
      user.todos.forEach(todo => {
        if (todo.id === id) {
          todo.title = title;
          todo.deadline = deadline;
          // return response.status(201).json(todo);
        } else {
          return response.status(400).json({ error: 'Todo is not exists.' })
          console.log("yes");
        }
      })
    }
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const id = request.params.id;

  users.forEach(user => {
    if (user.username === username) {
      user.todos.forEach(task => {
        if (task.id === id) {
          task.done = true
          return response.status(201).json(task.done);
        } else {
          return response.status(400).json({error: 'Todo is not exists.'});
        }
      })
    }
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const id = request.params.id;

  users.forEach(user => {
    if (user.username === username) {
      user.todos.forEach(task => {
        if (task.id === id) {
          user.todos.splice(id, 1);
          return response.status(201).json({ok: "ok"});
        }
      })
    }
  })
  return response.status(400).json({error: 'Task is not exists.'});

});

module.exports = app;