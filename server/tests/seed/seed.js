const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const dummyUsers = [
    {
        _id: userOneID,
        email: 'test.email@op.pl',
        password: 'userOnePassword',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneID, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: userTwoID,
        email: 'test.olga@op.pl',
        password: 'userTwoPassword',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    }
];


const dummyTodos = [
    {
        _id: new ObjectID(),
        text: 'dummy todo #1',
        completed: true,
        completedAt: 122333,
        _creator: userOneID
    },
    {
        _id: new ObjectID(),
        text: 'dummy todo #2',
        completed: false,
        completedAt: null,
        _creator: userTwoID
    }
];

const populateTodos = done => {
    Todo.remove({})
        .then(() => Todo.insertMany(dummyTodos))
        .then(() => done())
};

const populateUsers = done => {
    User.remove({})
        .then(() => {
            const userOne = new User(dummyUsers[0]).save();
            const userTwo = new User(dummyUsers[1]).save();

            return Promise.all([userOne, userTwo])
        })
        .then(() => done())
};

module.exports = {
    dummyTodos,
    populateTodos,
    dummyUsers,
    populateUsers
};

