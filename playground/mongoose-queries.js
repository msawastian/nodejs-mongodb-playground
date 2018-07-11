const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


// const id = '5b4672333bf88a0590078980';
//
// if (!ObjectID.isValid(id)) {
//    return console.log('Not a valid ID')
// }

// Todo.find({
//     _id: id
// }).then(todos => console.log('Todos:', todos));
//
// Todo.findOne({
//     _id: id
// }).then(todo => console.log('Todo:', todo));

// Todo.findById(id).then(todo => {
//     if (!todo) {
//         return console.log('Todo not found')
//     }
//     console.log('Todo by id:', todo)
// }).catch(error => console.log(error));

const userID = '5b4608eb51f42107980d1694';

User.findById(userID).then(user => {
    if (!user) {
        return console.log('User not found')
    }

    console.log('User:', user)
}).catch(error => console.log(error));