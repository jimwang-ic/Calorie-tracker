// Including the package
var express = require('express');
var dnode = require('dnode');
var anyDB = require('any-db');
var engines = require('consolidate');

// Set varable for library call
var app = express();
app.use(express.bodyParser()); 

// What does that mean by static here?
app.use('/public', express.static(__dirname + '/public'));
app.use('/public/scripts', express.static(__dirname + '/public/scripts'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/fonts', express.static(__dirname + '/fonts'));

// Where is the template and why do we ues the template?
app.engine('html', engines.hogan);     // tell Express to run .html files through Hogan
app.set('views', __dirname + '/view');  // tell Express where to find templates


//likely migrate this way down the page
//what db to use?
var conn = anyDB.createConnection('sqlite3://database.db');
conn.query('CREATE TABLE users (userid INTEGER, username TEXT, password TEXT);') 
    .on('end', function() {
      console.log('Made table!');
    });
conn.query('CREATE TABLE calendar (datetime INTEGER, foodweight BINARY, mealname TEXT, totalcalories INTEGER, foodid INTEGER, weight INTEGER);') 
  .on('end', function() {
    console.log('Made table!');
    //test();
  });




app.get('/', function(req,res){

	res.render('Calendar.html');
		
});

app.get('/form',function(req,res) {
	res.render('form.html');

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
			res.send(result);
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
			res.send(result);
			conn.end();
			
		});
			
	});	
			
});

//Displays Graph
app.get('/graph', function(req,res) {
  
  res.render('graph.html');
  
});

//Displays form
app.get('/form1', function(req,res) {
	
	res.render('form.html');
});


/**
JSON format
entry {
	date: 4-23-13
	food: [[calories,id,name][calories2,id2,name2]]
	OR weight: int
}



**/
app.post('/addmeal', function(req,res) {
	console.log("here!");
	var meal = JSON.parse(req.body.meal);
	console.log(meal);
	food = meal['food']
	time = meal['date']
	console.log(meal);
	meals += 1;
	ids = "";
	names = "";
	calories = 0;
	for (var i = 0; i < food.length-1; i++) {
		ids += food[i]['id'] + ",";
		names += food[i]['name'] + " , ";
		calories += food[i]['calories'];
	}
	ids += food[food.length-1]['id'];
	names += ", and" + food[food.length-1]['name'];
	calories += food[food.length-1]['calories'];
	//date,foodorweight,name,calories,id,weight
	//conn.query('SQL STATEMENT', function(error, result) {...});
	conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6)', [meal['date'],1,names,calories,ids,0],function(error,result){
		console.log(error);
	});
	//conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6)', time,food[0],food[1],food[2],food[3],food[4]);
	console.log("after");
	console.log('done');
	res.render('graph.html');
});


app.listen(8080);
console.log('Listen on port 8080');


/**
 * Get data for graph from DB
 * returns all entries within given time
 * returns dataset of pairs of coordinates datetime and other calories
*/
app.get('/graph.json',function(req,res) {
	var data = {};
	data['food'] = [];
	data['weight'] = [];
	//as of now returns everything
	//conn.query('SELECT * FROM calendar WHERE datetime BETWEEN $1 AND $2',[start,end])
	conn.query('SELECT * FROM calendar;')
		.on('row',function(row) {
			console.log(row);
			if (row.foodweight == 1) {
				data['food'].push([row.datetime,row.totalcalories])
			}
			else {
				data['weight'].push([row.datetime, row.weight]);
			}
			

		})
		.on('end',function(row) {

			console.log('about to return');
			console.log(data);
			res.json(data);
		})

});


//------------------------------------------------------------
//DATABASE BELOW
//MAYBE TO MIGRATE TO MODULE FILE

// serves as bullshit primary key
var userscount = 0;
function test() {
	for (var i = 0; i < 5; i++) {
		console.log("here");
		meal = {};
		//date,foodorweight,name,calories,id,weight
		//meal['time'] = new Date().getDate();
		datetime = new Date('2013/04/2'+i)
		console.log(datetime.getDate());
		meal['time'] = datetime.getTime();
		meal['food'] = [];
		meal['food'][0] = 1;
		meal['food'][1] = "something";
		meal['food'][2] = 300 + i;
		meal['food'][3] = 300 * i;
		meal['food'][4] = 0;
		addMeal(meal);
	}
	console.log('all done');

}

var meals = 0;

/**
 * 
 * Takes in meal object and adds its contents to database
 * Meal object will be {
 * 	[food],time
 * }
 * 
 */
function addMeal(meal) {
  
  
}



/**
 * given day returns meal
 * 
 */
function getMeal(time) {
  var item = conn.query('SELECT * FROM calendar WHERE datetime = $1',time);
  return item;
}




/**
* Adds new user to database.  Should also create new CALENDAR?  Returns userid?
**/
function addUser(username,password) {
	conn.query('INSERT INTO users VALUES ($1,$2,$3)',userscount,username,password);
	return userscount; //unique id is count?
}
