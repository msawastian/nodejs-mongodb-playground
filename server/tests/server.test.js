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
            .set('x-auth', dummyUsers[0].tokens[0].token)
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
            .set('x-auth', dummyUsers[0].tokens[0].token)
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
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect(response => {
                expect(response.body.todos.length).toBe(1);
            })
            .end(done)
    })
});

describe('GET /todos/:id', () => {
    it('should return todo document', done => {
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect(response => {
                expect(response.body.document.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('should not return a todo document created by other user', done => {
        request(app)
            .get(`/todos/${dummyTodos[1]._id.toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-objectIDs and return an error message', done => {
        request(app)
            .get('/todos/123')
            .set('x-auth', dummyUsers[0].tokens[0].token)
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
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect(response => {
                expect(response.body.document._id).toBe(id)
            })
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                Todo.findById(id).then(document => {
                    expect(document).toBeFalsy();
                    done()
                }).catch(error => done(error))
            })
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done)
    });

    it('should return 404 if objecID is invalid', done => {
        request(app)
            .delete('/todos/123')
            .set('x-auth', dummyUsers[0].tokens[0].token)
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
           .set('x-auth', dummyUsers[1].tokens[0].token)
           .send({
               completed: true,
               text
           })
           .expect(200)
           .expect(response => {
               expect(response.body.todo.completed).toBe(true);
               expect(response.body.todo.text).toBe(text);
               expect(typeof response.body.todo.completedAt).toBe('number');
           })
           .end(done)
   });

   it('should not update the todo of a other user', done => {
       const id = dummyTodos[1]._id.toHexString();
       const text = 'Updated text';

       request(app)
           .patch(`/todos/${id}`)
           .set('x-auth', dummyUsers[0].tokens[0].token)
           .send({
               completed: true,
               text
           })
           .expect(404)
           .end(done)
   });

   it('should clear completedAt when todo is not completed', done => {
       const id = dummyTodos[0]._id.toHexString();

       request(app)
           .patch(`/todos/${id}`)
           .set('x-auth', dummyUsers[0].tokens[0].token)
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
                expect(response.headers['x-auth']).toBeTruthy();
                expect(response.body._id).toBeTruthy();
                expect(response.body.email).toBe(email)
            })
            .end(error => {
                if (error) {
                    return done(error)
                }

                User.findOne({email: email})
                    .then(user => {
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
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
               expect(response.headers['x-auth']).toBeTruthy();
           })
           .end((error, response) => {
               if (error) {
                   return done(error)
               }

               User.findById(dummyUsers[1]._id)
                   .then(user => {
                       expect(user.tokens[1]).toMatchObject({
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
                expect(response.headers['x-auth']).toBeFalsy();
            })
            .end((error) => {
                if (error) {
                    return done(error)
                }

                User.findById(dummyUsers[1]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(1);
                        done();
                    })
                    .catch(error => done(error))
            })
   })
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .end((error) => {
                if (error) {
                    return done(error)
                }

                User.findById(dummyUsers[0]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch(error => done(error))

            })


    })
});