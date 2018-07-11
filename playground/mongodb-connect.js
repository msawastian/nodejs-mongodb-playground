const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server', error)
    }

    const db = client.db('TodoApp');

    console.log('Connected to MongoDB server');

    // db.collection('Todos').insertOne({
    //     text: 'Test todo',
    //     completed: false
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert todo', error)
    //     }
    //
    //     console.log(JSON.stringify(result.ops, undefined, 2))
    // });

    db.collection('Users').insertOne({
        name: 'Mateusz',
        age: 26,
        location: 'Poznań'
    }, (error, result) => {
        if (error) {
            return console.log('Unable to insert user', error)
        }

        console.log(result.ops[0]._id.getTimestamp());

        console.log(JSON.stringify(result.ops, undefined, 2))
    });


    client.close();
});