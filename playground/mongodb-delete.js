// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server', error)
    }

    console.log('Connected to MongoDB server');


    db.collection('Users').deleteMany({name: 'Mateusz'}).then(
        result => console.log(result)
    );

    // db.collection('Users').deleteOne({name: 'Mateusz'}).then(
    //     result => console.log(result)
    // );

    db.collection('Users').findOneAndDelete({_id: new ObjectID('5b45da49f3b5b10c5499bbc9')}).then(
        result => console.log(result)
    );

    db.close();
});