const {ObjectID} = require('mongodb');

const {Todo} = require('./../../models/todo');

const dummyTodos = [
    {
        _id: new ObjectID(),
        text: 'dummy todo #1',
        completed: true,
        completedAt: 122333
    },
    {
        _id: new ObjectID(),
        text: 'dummy todo #2',
        completed: false,
        completedAt: null
    }
];

const populateTodos = done => {
    Todo.remove({})
        .then(() => Todo.insertMany(dummyTodos))
        .then(() => done())
};


module.exports = {
    dummyTodos,
    populateTodos
};

