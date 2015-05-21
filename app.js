var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var port = 3000;

var morgan = require('morgan');
var bodyParser = require('body-parser');

// Serve static files
app.use(express.static(__dirname + '/public'));

// Set up express app
app.use(morgan('dev')); // log every request to the console.
app.use(bodyParser()); // get information from xhr or form submit calls

var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		},
		checkMessage: function(message, options) {
			if(message.length > 0) return options.fn(this);
		}
	}
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// routes
require('./app/routes.js')(app)

// launch
app.listen(port);
console.log('The magic happens on port' + port + '....');
