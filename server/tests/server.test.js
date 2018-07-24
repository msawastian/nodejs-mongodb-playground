const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {dummyTodos, populateTodos, dummyUsers, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = 'Test data';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(response => {
                expect(response.body.text).toBe(text);
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                Todo.find({text: 'Test data'}).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(error => done(error))
            });
    });

    it('should not create a todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .expect(400)
            .end( (error, response) => {
                if (error) {
                    return done(error)
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2)
                    done();
                }).catch(error => done(error))
            })

    })
});

describe('GET /todos', () => {
    it('should get all todos', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(response => {
                expect(response.body.todos.length).toBe(2);
            })
            .end(done)
    })
});

describe('GET /todos/:id', () => {
    it('should return todo document', done => {
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect(response => {
                expect(response.body.document.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-objectIDs and return an error message', done => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .expect(response => {
                expect(response.body.error).toBe('Not a valid ID')
            })
            .end(done)
    })
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
        const id = dummyTodos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(response => {
                expect(response.body.document._id).toBe(id)
            })
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                Todo.findById(id).then(document => {
                    expect(document).toNotExist()
                    done()
                }).catch(error => done(error))
            })
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString}`)
            .expect(404)
            .end(done)
    });

    it('should return 404 if objecID is invalid', done => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done)
    });

});

describe('PATCH /todos/:id', () => {
   it('should update the todo', done => {
       const id = dummyTodos[1]._id.toHexString();
       const text = 'Updated text';

       request(app)
           .patch(`/todos/${id}`)
           .send({
               completed: true,
               text
           })
           .expect(200)
           .expect(response => {
               expect(response.body.todo.completed).toBe(true);
               expect(response.body.todo.text).toBe(text);
               expect(response.body.todo.completedAt).toBeA('number');
           })
           .end(done)


   });

   it('should clear completedAt when todo is not completed', done => {
       const id = dummyTodos[0]._id.toHexString();

       request(app)
           .patch(`/todos/${id}`)
           .send({
               completed: false
           })
           .expect(200)
           .expect(response => {
               expect(response.body.todo.completed).toBe(false);
               expect(response.body.todo.completedAt).toBe(null);
           })
           .end(done)
   });
});

describe('GET /users/me', () => {
   it('should return user if authenticated', done => {
       request(app)
           .get('/users/me')
           .set('x-auth', dummyUsers[0].tokens[0].token)
           .expect(200)
           .expect(response => {
               expect(response.body._id).toBe(dummyUsers[0]._id.toHexString());
               expect(response.body.email).toBe(dummyUsers[0].email)
           })
           .end(done)
   });

   it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(response => {
                expect(response.body).toEqual({})
            })
            .end(done)
   });
});

describe('POST /users', () => {
    it('should create a user', done => {
        const email = 'example@example.com',
            password = '123abc';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(response => {
                expect(response.headers['x-auth']).toExist();
                expect(response.body._id).toExist();
                expect(response.body.email).toBe(email)
            })
            .end(error => {
                if (error) {
                    return done(error)
                }

                User.findOne({email: email})
                    .then(user => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    })
                    .catch(error => done(error))
            })

    });

    it('should return validation errors if request is invalid', done => {
        request(app)
            .post('/users')
            .send({
                email: '',
                password: '123'
            })
            .expect(400)
            .end(done)
    });

    it('should not create user if email in use', done => {
        request(app)
            .post('/users')
            .send({email: dummyUsers[0].password, password: '12312345677'})
            .expect(400)
            .end(done)
    });
});

describe('POST /users/login', () => {
   it('should login user and return auth token', done => {
       request(app)
           .post('/users/login')
           .send({
               email: dummyUsers[1].email,
               password: dummyUsers[1].password
           })
           .expect(200)
           .expect(response => {
               expect(response.headers['x-auth']).toExist();
           })
           .end((error, response) => {
               if (error) {
                   return done(error)
               }

               User.findById(dummyUsers[1]._id)
                   .then(user => {
                       expect(user.tokens[0]).toInclude({
                           access: 'auth',
                           token: response.headers['x-auth']
                       });
                       done();
                   })
                   .catch(error => done(error))
           })
   });

   it('should reject invalid login', done => {
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].email,
                password: "asdfghjkl"
            })
            .expect(400)
            .expect(response => {
                expect(response.headers['x-auth']).toNotExist();
            })
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                User.findById(dummyUsers[1]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch(error => done(error))
            })
   })
});