const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


Todo.remove({}).then(result => console.log(result)); //remove all

Todo.findOneAndRemove("something").then(result => console.log(result)); //remove one and return removed document

Todo.findByIdAndRemove("sample id").then(result => console.log(result)); //remove by id and return remved document