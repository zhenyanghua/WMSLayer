var request = require('request');

module.exports = function(app) {
	// app.all('/', function(req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "*");
	// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	// 	next()
	// });
	app.get('/', function(req, res) {
		res.render('index');
	});
	app.post('/get-feature-info', function(req, res) {
		request(req.body.url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var result = JSON.parse(body);
				res.send(result);
			}
		})
		
	});
}