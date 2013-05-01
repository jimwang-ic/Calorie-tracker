// Including the package
var express = require('express');
var dnode = require('dnode');
var anyDB = require('any-db');
var engines = require('consolidate');
var fs = require('fs');

// Set varable for library call
var app = express();
app.use(express.bodyParser()); 

// What does that mean by static here?
app.use('/public', express.static(__dirname + '/public'));
app.use('/public/scripts', express.static(__dirname + '/public/scripts'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use(express.cookieParser());

app.use(express.session({
	secret: 'session_key',
	store: new express.session.MemoryStore({reapInterval: 60000 * 15})
}));

app.use(app.router);


// Where is the template and why do we ues the template?
app.engine('html', engines.hogan);     // tell Express to run .html files through Hogan
app.set('views', __dirname + '/view');  // tell Express where to find templates


//likely migrate this way down the page
//what db to use?
var conn = anyDB.createConnection('sqlite3://database.db');
fs.exists('database.db',function(exists) {
    if (exists == false) {
	conn.query('CREATE TABLE users (userid INTEGER PRIMARY KEY, username TEXT, password TEXT);') 
	    .on('end', function() {
	    console.log('Made table!');
	    });
	conn.query('CREATE TABLE calendar (id INTEGER PRIMARY KEY, datetime INTEGER, foodweight BINARY, mealname TEXT, totalcalories INTEGER, foodid INTEGER, weight INTEGER, mealtype TEXT);') 
	.on('end', function() {
	    console.log('Made table!');
	    
	    //UNCOMMENT FOR TEST POINTS
	    //test();
	});
    }
  
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
	var food = meal['food']
	var time = meal['date']
	var mealtype = meal['mealtype'];
	console.log(meal);
	console.log(mealtype);
	ids = "";
	names = "";
	calories = 0;
	for (var i = 0; i < food.length-1; i++) {
		ids += food[i]['id'] + ",";
		names += food[i]['name'] + " , ";
		calories = calories + parseInt(food[i]['calories']);
	}
	ids += food[food.length-1]['id'];
	names += food[food.length-1]['name'];
	calories += parseInt(food[food.length-1]['calories']);
	//id,date,foodorweight,name,calories,id,weight
	conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [null,meal['date'],1,names,calories,ids,0,mealtype],function(error,result){
		console.log("insert : " + error);
	});
	console.log("after");
	console.log('done');
	
	res.render('Calendar.html');
});




app.listen(8080);
console.log('Listen on port 8080');


/**
 * Get data for graph from DB
 * returns all entries within given time
 * returns dataset of pairs of coordinates datetime and other calories
*/
app.get('/graph.json',function(req,res) {
    var start = req.query['start'];
    var end = req.query['end'];
    var data = {};
    data['food'] = [];
    data['weight'] = [];
    console.log("between " + start + " " + end);
    var dates = {};
    //as of now returns everything
    //conn.query('SELECT * FROM calendar WHERE datetime BETWEEN $1 AND $2',[start,end])
    conn.query('SELECT * FROM calendar WHERE datetime BETWEEN $1 AND $2;',[start,end])
	    .on('row',function(row) {
		console.log(row);
		if (row.foodweight == 1) {
		    if (dates[row.datetime] == undefined) {
			console.log("here");
			dates[row.datetime] = [];
		    }
		    dates[row.datetime].push([row.totalcalories,row.id,row.mealtype,row.mealname]);
		}
		else {
		    data['weight'].push([row.datetime, row.weight,row.id]);
		}
		
		
		console.log(row.mealname);
		var day = new Date(row.datetime).getDate();
		var entry = {};
		entry['mealname'] = row.mealname;
		entry['id'] = row.id;
		entry['totalcalories'] = row.totalcalories;
		entry['mealtype'] = row.mealtype;
		if (data[day] == undefined) {
		    data[day] = [];
		}
		data[day].push(entry);
		

	    })
	    .on('end',function(row) {
		for (var time in dates) {
		    console.log("counting");
		    console.log(dates[day]);
		    var day_calories = 0;
		    var hidden_items = [];
		    var day = dates[time];
		    for (var i = 0; i < day.length; i++) {
			var meal = day[i];
			console.log(meal);
			day_calories += meal[0];
			hidden_items.push(meal[1]);
			hidden_items.push(meal[2]);
			hidden_items.push(meal[3]);
		    }
		    data['food'].push([parseInt(day),day_calories,[hidden_items]]);
		}
	
		console.log('about to return');
		console.log(row);
		//examinePrevious();
		res.json(data);
	    })

});


/**
 *
 * Get entry object from database, returns in JSON format (including unique id)
 *entry {
    date: datetime (integer)
    food: [id1,id2,id3]
    OR weight: int
    entry id
}
**/
app.get('/entry.json',function(req,res) {
    var entry = {};
    if (req.query['id'] == null) {
	res.json(entry);
    }
    else {
	conn.query('SELECT * FROM calendar WHERE id = $1;',[req.query['id']])
	    .on('row',function(row) {
		console.log(row);
		if (row.foodweight == 1) {
		    if (row.foodid.toString().indexOf(",") !== -1) { //there is more than one
			entry['food'] = row.foodid.split(','); //undo CSV
		    }
		    else {
			entry['food'] = [row.foodid];
		    }
		    entry['mealtype'] = row.mealtype;
		}
		else {
		    entry['weight'] = row.weight;
		}
		entry['id'] = row.id;
		entry['datetime'] = row.datetime;
		res.json(entry);
	    });
    }
	
});



/**e

CALENDAR TO DATABASE
SENDS: month/year (mm-yy), username
returns: rows of database: meal name, day, id, totalcalories, mealtype

**/
app.get('/calendar.json',function(req,res) {
    var data = {};
    console.log("date " + req.query['date']);
    try {
	var date = req.query['date'].split('-');
    }
    catch(err) {
	console.log(err);
	var date = [2013,05]; //default april 2013
    }
    var start = new Date(date[0],date[1]-1,1);
    var end = new Date(date[0],date[1],0);
    var name = req.username;
    console.log("start " + start);
    console.log(end);
    conn.query('SELECT mealname,datetime,totalcalories,id,mealtype FROM calendar WHERE datetime BETWEEN $1 AND $2',[start,end])
	.on('row',function(row) {
	    console.log(row.mealname);
	    var day = new Date(row.datetime).getDate();
	    var entry = {};
	    entry['mealname'] = row.mealname;
	    entry['id'] = row.id;
	    entry['totalcalories'] = row.totalcalories;
	    entry['mealtype'] = row.mealtype;
		if (data[day] == undefined) {
		data[day] = [];
	    }
	    data[day].push(entry);
	})
	.on('end',function(row) {
	    //examinePrevious(); add later
	    res.json(data);
	});
});


//------------------------------------------------------------
//  TEST 

function test() {
	for (var i = 0; i < 5; i++) {
		meal = {};
		meal['username'] = "username";
		meal['date'] = new Date(2013,03,i+1);
		food = [];
		food[0] = {}
		food[0]['id'] = 1111;
		food[0]['name'] = 'something';
		food[0]['calories'] = 200+i;
		meal['food'] = []
		ids = "";
		names = "";
		calories = 0;
		for (var j = 0; j < food.length-1; j++) {
			ids += food[j]['id'] + ",";
			names += food[j]['name'] + " , ";
			calories += food[j]['calories'];
		}
		ids += food[food.length-1]['id'];
		names += food[food.length-1]['name'];
		calories += food[food.length-1]['calories'];
		//date,foodorweight,name,calories,id,weight
		//conn.query('SQL STATEMENT', function(error, result) {...});
		conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6,$7)', [null,meal['date'],1,names,calories,ids,0],function(error,result){
			console.log(error);
		});
		//conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6)', time,food[0],food[1],food[2],food[3],food[4]);
		console.log("after");
		console.log('done');
	}
	console.log('all done');

}








/**
* Adds new user to database.  Should also create new CALENDAR?  Returns userid?
**/
function addUser(username,password) {
	conn.query('INSERT INTO users VALUES ($1,$2,$3)',userscount,username,password);
	return userscount; //unique id is count?
}


//BEGIN AI STUFF
//will be called on each calendar call (opening of page)
//examines dates from last meal input until now and prompts user to enter meal on dates missed
//user can choose to enter automatic dates if they want
function examinePrevious() {
    //first get max date from database
    console.log("THIS SHIT RIGHT HERE");
    var time;
    conn.query('SELECT MAX(datetime) AS date from calendar',function(err,rows,fields) {
	/*console.log(rows);
	time = parseInt(rows['rows'][0]['date']);
	console.log(new Date(time));
	var today = new Date();
	console.log(today);
    
	var difference = today.getTime() - time;
	var hoursdiff = difference / 216000;
	console.log(hoursdiff/24 + " days and " + hoursdiff % 24 + " hours");*/
    });

    
    
    
}

//END AI STUFF
