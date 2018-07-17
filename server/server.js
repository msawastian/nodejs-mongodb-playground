require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (request, response) => {
    const todo = new Todo({
        text: request.body.text,
        completed: request.body.completed,
        completedAt: request.body.completedAt
    });

    todo.save().then(
        document => response.send(document),
        error => response.status(400).send(error)
    )
});

app.get('/todos', (request, response) => {
    Todo.find().then(
        todos => response.send({todos}),
        error => response.status(400).send(error)
    )
});

app.get('/todos/:id', (request, response) => {
    const id = request.params.id;

    if (!ObjectID.isValid(id)) {
         return response.status(404).send({
            error: 'Not a valid ID'
        });
    }

    Todo.findById(id)
        .then(document => {
            if (!document) {
                return response.status(404).send();
            }

            response.send({document})
        })
        .catch(error => response.status(400).send())

});

app.delete(`/todos/:id`, (request, response) => {
    const id = request.params.id;

    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }

    Todo.findByIdAndRemove(id).then(document => {
        if (!document) {
            return response.status(404).send();
        }

        response.status(200).send({document});
    }).catch(error => response.status(400).send())
});

app.patch('/todos/:id', (request, response) => {
    const id = request.params.id;
    const body = _.pick(request.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
        if (!todo) {
            return response.status(404).send();
        }

        response.send({todo})
    }).catch(error => {
        response.status(400).send();
    })
});

app.post('/users/', (request, response) => {
    const body = _.pick(request.body, ['email', 'password']);
    const newUser = new User({...body});

    newUser.save()
        .then(() => {
            return newUser.generateAuthToken();
        })
        .then(token => {
            response.header({'x-auth': token}).send(newUser)
        })
        .catch(error => response.send(error))
});


app.listen(port, () => {
    console.log(`Started on port ${port}.`)
});

module.exports = {app};