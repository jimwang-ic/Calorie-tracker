var express = require('express');
var dnode = require('dnode');
var anyDB = require('any-db');
var engines = require('consolidate');

var app = express();
app.use(express.bodyParser()); 
app.use('/public', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/fonts', express.static(__dirname + '/fonts'));

app.engine('html', engines.hogan);     // tell Express to run .html files through Hogan
app.set('views', __dirname + '/view');  // tell Express where to find templates

app.get('/', function(req,res){

	res.render('Calendar.html');
		
});

// Conducts a search of the food database using the search expression specified.
app.get('/searchFood.json', function(req,res){
	
	console.log('Search Food:', req.query.food);
	
	var Search_string = req.query.food;
	var ip = 'ec2-54-244-185-162.us-west-2.compute.amazonaws.com';
	var port = 8811;
	
	// Connect to DNode server for FatSecretAPI.php running in above ip with TCP port 8811 
	// and call "foodsearch" with arugment Search_string. 
	// more infomation about dnode see the following:
	// http://bergie.iki.fi/blog/dnode-make_php_and_node-js_talk_to_each_other/
	dnode.connect(ip,port, function (remote, conn) {
		remote.foodSearch(Search_string, function (result) {		
			
			// return in JSON format
			// desciption for json : 
			// http://platform.fatsecret.com/api/Default.aspx?screen=rapiref&method=foods.search
			res.json(result);
			conn.end();
			
		});
			
	});	
			
});

// Returns detailed nutritional information for the specified food. 
// Use this call to display nutrition values for a food to users.
app.get('/getFood.json', function(req,res){
	
	console.log('Get Food:', req.query.foodid);
	
	var food_id = req.query.foodid;
	var ip = 'ec2-54-244-185-162.us-west-2.compute.amazonaws.com';
	var port = 8811;
	
	// Connect to DNode server for FatSecretAPI.php running in above ip with TCP port 8811 
	// and call "getFood" with arugment Search_string. 
	dnode.connect(ip,port, function (remote, conn) {
		remote.getFood(food_id, function (result) {		
			
			// return in JSON format
			// desciption for json : 
			// http://platform.fatsecret.com/api/Default.aspx?screen=rapiref&method=food.get
			res.json(result);
			conn.end();
			
		});
			
	});	
			
});



app.listen(8080);
console.log('Listen on port 8080');