// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server', error)
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({
    //     _id: new ObjectID('5b4480fc647d437d59781ebb') //needs to be an ObjectID, not a string
    // }).toArray().then(docs => {
    //     console.log('Todos:');
    //     console.log(JSON.stringify(docs, undefined, 2))
    // }, error => console.log('Unable to fetch', error));

    // db.collection('Todos').find().count().then(count => {
    //     console.log(`Todos count: ${count}`)
    // }, error => console.log('Unable to fetch', error));

    db.collection('Users').find({name: 'Mateusz'}).toArray().then(
        documents => console.log(JSON.stringify(documents, undefined, 2)),
        error => console.log(error)
    );


    db.close();
});