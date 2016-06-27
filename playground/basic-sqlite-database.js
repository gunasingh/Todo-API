var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING
	},
	completed: {
		type: Sequelize.BOOLEAN
	}
});

sequelize.sync().then(function() {
	console.log('Everything is synced.');

	Todo.create({
		description: 'Watch game of thrones',
		completed: false
	}).then(function(todo) {
		console.log('finished');
		console.log(todo);
	});
});

