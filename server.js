var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', function(req, res) {
    var query = req.query;
    var where = {};
    /*var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {
            completed: true
        });
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {
            completed: false
        });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
        filteredTodos = _.filter(filteredTodos, function(todo) {
            if (todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1) {
                return true;
            }
            return false;
        });
    }

    res.json(filteredTodos);*/
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    /*var matchedTodo = _.findWhere(todos, {
        id: todoId
    });

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }*/
    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    });
});

// POST /todos
app.post('/todos', function(req, res) {
    // Accept only the required fields
    var body = _.pick(req.body, 'description', 'completed');

    /*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        // Bad data status
        return res.status(400).send();
    }

    // Set body.description to be trimmed value
    body.description = body.description.trim();

    body.id = todoNextId++;
    todos.push(body);

    res.json(body);*/
    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }).catch(function (e) {
        res.status(400).json(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();
        }
    }, function () {
        res.status(500).send();
    });
    // var deleteTodo = _.findWhere(todos, {
    //     id: todoId
    // });

    // if (deleteTodo) {
    //     todos = _.without(todos, deleteTodo);
    //     res.json(deleteTodo);
    // } else {
    //     res.status(404).send();
    // }
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    /*var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    } else {
        // Never provided attribute, no problem here
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    // HERE
    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);*/

    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            })
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});


//POST /users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
        res.json(user.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT + '!');
    });
});