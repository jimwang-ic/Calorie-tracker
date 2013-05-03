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
app.use('/view', express.static(__dirname + '/view'));
app.use('/images', express.static(__dirname + '/images'));
app.use(express.cookieParser());
app.use(express.bodyParser());

app.use(express.session({
	secret: 'session_key',
	store: new express.session.MemoryStore({reapInterval: 60000 * 15})
}));

app.use(app.router);


// Where is the template and why do we ues the template?
app.engine('html', engines.hogan);     // tell Express to run .html files through Hogan
app.set('views', __dirname + '/view');  // tell Express where to find templates

app.listen(8080);
console.log('Listen on port 8080');


//likely migrate this way down the page
//what db to use?
var conn;
fs.exists('database.db',function(exists) {
	conn = anyDB.createConnection('sqlite3://database.db');
    if (exists === false) {
		conn.query('CREATE TABLE users (userid INTEGER PRIMARY KEY, username TEXT, password TEXT);') 
		    .on('end', function(end) {
		    console.log('Made table!');
		    });
    }
  
});





app.post('/login', function(req, res) {
		//Use this variable in other functions to call correct user 
		req.session.userID = req.body.username;


		if (req.body.submit == "Register") {
		//check if user is already registered 
			conn.query('SELECT userid FROM users WHERE username = $1;', [req.body.username],function(error,result){
			    console.log(result);
				if (result.rows.length > 0) {
					//Alert user that either that username is taken, or user has already registered 
					res.render('login.html');
				}
				//Otherwise, create new username/password entry in user database 
				else {
				    var userid;
					conn.query('INSERT INTO users VALUES ($1, $2, $3);', [null, req.body.username, req.body.password],function(error,result) {
					    conn.query('SELECT last_insert_rowid() AS userid',function(error,result) {
						userid = result.rows[0].userid;
						conn.query('CREATE TABLE table_' + userid + ' (id INTEGER PRIMARY KEY, datetime INTEGER, foodweight BINARY, mealname TEXT, totalcalories INTEGER, foodid INTEGER, mealtype TEXT, weight INTEGER, servings TEXT);')
						.on('end',function() {
						    req.session.userid = userid;
						    req.session.username = req.body.username;
						    res.render('Calendar.html'); 
						});
						
					    });
					});
				}
		
			});
		}

		
		if (req.body.submit == "Login") {
		    console.log(req.body.password);
			conn.query('SELECT * FROM users WHERE username=$1 AND password=$2;', [req.body.username, req.body.password],function(error,result) {
				if (result.rows.length == 0) {
					//Alert user that username/password pair is incorrect, or user is not registered 
					console.log("username or password incorrect, or user has not registered");
					res.render('login.html');
				}
				//Otherwise, log user in
				else { 
				    console.log(result);
				    var userid = result.rows[0].userid;
				    req.session.userid = userid;
				    req.session.username = req.body.username;
				    res.render('Calendar.html'); 
				}
			
			});
		
		}
});


app.get('/', function(req,res){
	res.render('login.html');
	//res.render('Calendar.html');
		
});

app.get('/form',function(req,res) {
	res.render('form.html');

});


// Conducts a search of the food database using the search expression specified.
app.get('/searchFood.json', function(req,res){
	
	console.log('Search Food:', req.query.food);
	
	var Search_string = req.query.food;
	var ip = 'ec2-54-244-185-162.us-west-2.compute.amazonaws.com';0
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


/**
JSON format
entry {
	date: 4-23-13
	food: [[calories,id,name][calories2,id2,name2]]
	OR weight: int
**/
app.post('/addmeal', function(req,res) {
	console.log("============= adding meal ===================");
	var meal = JSON.parse(req.body.meal);
	console.log(meal);
	var time = meal['date'];
	
	// Edit meal
	// delete the sperate meals in database, then add the combined one
	if(meal.ids != undefined)
	{
		var ids = meal.ids;
		var where_condition = "";
		
		for(key in ids)
		{
			where_condition += "'" +  ids[key]  + "',";	
		}
		
		where_condition = where_condition.substring(0, where_condition.length -1);
		
		console.log(where_condition);
		
		conn.query('DELETE FROM table_' + req.session.userid + ' WHERE id in (' +  where_condition + ')')
			.on('error', console.error);
	}
		
	if (meal['food'] != undefined) {
	    var food = meal['food'];
	    var mealtype = food[0]['mealtype'];
	    ids = "";
	    names = "";
	    mealtypes = "";
	    servings = "";
	    calories = 0;
	    for (var i = 0; i < food.length-1; i++) {
		    ids += food[i]['id'] + ",";
		    names += food[i]['name'] + " , ";
		    calories = calories + parseInt(food[i]['calories']);
		    servings += food[i]['servings'] + "*" + food[i]['calories']/food[i]['servings'] + ",";
	    }
	    ids += food[food.length-1]['id'];
	    names += food[food.length-1]['name'];
	    calories += parseInt(food[food.length-1]['calories']);
	    servings += food[food.length-1]['servings'] + "*" + food[food.length-1]['calories']/food[food.length-1]['servings'];
	    //(id INTEGER PRIMARY KEY, datetime INTEGER, foodweight BINARY, mealname TEXT, totalcalories INTEGER, foodid INTEGER, mealtype TEXT, weight INTEGER, servings TEXT)
	    conn.query('INSERT INTO table_' + req.session.userid + ' VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [null,meal['date'],1,names,calories,ids,mealtype,0,servings],function(error,result){
		    console.log("insert : " + error);
	    });
	    console.log("done adding meal");
	}
	
	console.log(meal.weight);
	
	if (meal['weight'] != undefined) {
		//console.log("adding weight");
		//console.log(meal.date);
	    var weight = parseInt(meal['weight']);
	    //console.log(weight);
	    conn.query('INSERT INTO table_' + req.session.userid + ' VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [null,meal['date'],0,null,null,null,null,weight,null],function(error,result){
		    console.log("insert weight: " + error);
	    });
	}
	
	res.render('Calendar.html');
});

/**
  Delete Meal
**/
app.post('/deletemeal',function(req,res) {
	
	console.log("============ delete meal!! =========")
	var meal = JSON.parse(req.body.meal);
	var ids = meal.ids;
	console.log(ids);
	var where_condition = "";
	
	for(key in ids)
	{
		where_condition += "'" +  ids[key]  + "',";	
	}
	
	where_condition = where_condition.substring(0, where_condition.length -1);
	
	console.log(where_condition);
	
	conn.query('DELETE FROM table_' + req.session.userid + ' WHERE id in (' +  where_condition + ')')
		.on('error', console.error);
			
	res.send();
	
   /*
 var id = req.body.id;
    conn.query('DELETE FROM table_' + req.session.userid + ' WHERE id=$1;',[id]);
    res.render('Calendar.html');
*/
});

/**
	Edit Meal
**/
app.post('/editmeal', function(req,res){
	console.log("============ edit meal");
	var meal = JSON.parse(req.body.meal);
	//console.log(req.body.meal.ids);
	var ids = meal.ids;
	var where_condition = "";
	
	for(key in ids)
	{
		where_condition += "'" +  ids[key]  + "',";	
	}
	
	where_condition = where_condition.substring(0, where_condition.length -1);
	console.log(where_condition);
	
	conn.query('DELETE FROM table_' + req.session.userid + ' WHERE id in (' +  where_condition + ')')
		.on('error', console.error);
	
	
	
	console.log("============ edit meal finished");
	res.send();
	
});



/**
 * Get data for graph from DB
 * returns all entries within given time
 * returns dataset of pairs of coordinates datetime and other calories
*/
app.get('/graph.json', function(req,res){

    var start = req.query['start'];
    var end = req.query['end'];
    var data = {};
    data['food'] = [];
    data['weight'] = [];
    var dates = {};
    //as of now returns everything
    //conn.query('SELECT * FROM calendar WHERE datetime BETWEEN $1 AND $2',[start,end])
    conn.query('SELECT * FROM table_' + req.session.userid + ' WHERE datetime BETWEEN $1 AND $2 ORDER BY datetime;',[start,end])
	    .on('row',function(row) {
		console.log(row);
		if (row.foodweight == 1) {
		    if (dates[row.datetime] == undefined) {
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
		}app.post
		data[day].push(entry);
		

	    })
	    //id mealname mealtype totalcalories
	    .on('end',function(row) {
		var hidden_items = {};
		for (var time in dates) {
		    var day_calories = 0;
		    var hidden_items = [];
		    var day = dates[time];
		    for (var i = 0; i < day.length; i++) {
			var meal = day[i];
			var items = {};
			//array cooresponds to [row.totalcalories,row.id,row.mealtype,row.mealname]
			day_calories += meal[0];
			items['id'] = meal[1];
			items['mealname'] = meal[3];
			items['mealtype']=meal[2];
			items['totalcalories']=meal[0];
			hidden_items.push(items);
		    }
		    data['food'].push([parseInt(time),day_calories,hidden_items]);
		}app.post
	
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
    servings : [servings*calories]
    entry id
}
**/
app.get('/entry.json',function(req,res) {
    var entry = {};
    if (req.query['id'] == null) {
	res.json(entry);
    }
    else {
	conn.query('SELECT * FROM table_' + req.session.userid + ' WHERE id = $1;',[req.query['id']])
	    .on('row',function(row) {
		console.log(row);
		if (row.foodweight == 1) {
		    if (row.foodid.toString().indexOf(",") !== -1) { //there is more than one
			entry['food'] = row.foodid.split(','); //undo CSV
			entry['servings'] = row.servings.split(',');
		    }
		    else {
			entry['food'] = [row.foodid];
			entry['servings'] = [row.servings];
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


app.get('/history.json',function(req,res){
	conn.query('SELECT * FROM table_' + req.session.userid).on('row',function(row){
		console.log("query everything");
		console.log(row);
	}).on('end',function(row){
		res.json(row);
	});
});



/**e

CALENDAR TO DATABASE
SENDS: month/year (mm-yy), username
returns: rows of database: meal name, day, id, totalcalories, mealtype


**/
app.get('/calendar.json',function(req,res) {
    var data = {};
    try {
	var date = req.query['date'].split('-');
    }
    catch(err) {
	console.log(err);
	var date = [2013,05]; //default may 2013
    }
    var month = date[1] - 1;
    //we want five days before first day of the month for pulling previous meals
    var start = new Date(date[0],month,1);
    start.setDate(start.getDate()-5);
    var end = new Date(date[0],month+1,0);
    console.log(req.session.userid);
    conn.query('SELECT mealname,datetime,totalcalories,id,mealtype,foodid FROM table_' + req.session.userid + ' WHERE datetime BETWEEN $1 AND $2',[start,end])

	.on('row',function(row) {
	    console.log('each meal');
	    var d = new Date(row.datetime);
	    var day = parseInt(d.getDate());
	    if (d.getMonth() != month) {
		//prev 5 days
		var last = new Date(date[0],d.getMonth() +1,0);
		console.log(last.getDate());
		day =  parseInt(parseInt(day) - parseInt(last.getDate()));
	    }
	    var entry = {};
	    entry['mealname'] = row.mealname;
	    entry['id'] = row.id;
	    entry['totalcalories'] = row.totalcalories;
	    entry['mealtype'] = row.mealtype;
	    entry['foodid'] = row.foodid;
	    if (data[day] == undefined) {
		data[day] = [];
	    }
	    data[day].push(entry);
	})
	.on('end',function(row) {
	    //examinePrevious(); add later
	    console.log('to return');
	    console.log(data);
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
	userscount = 15; //Temporary dummy value 
	conn.query('INSERT INTO users VALUES ($1,$2,$3);', [userscount,username,password]);
	return userscount; //unique id is count?
}


//BEGIN AI STUFF
/**will be called every time meal is added
returns days,hours since last meal
adds missing days to data structure since last meal
**/
function timeSinceLast(userid) {
    //first get max date from database
    console.log("THIS SHIT RIGHT HERE");
    var recenttime;
    conn.query('SELECT datetime from table_' + userid + 'ORDER BY datetime DESC LIMIT 0,2',function(err,rows,fields) {
	console.log(rows);
	var recent = parseInt(rows['rows'][0]['datetime']);
	var secondrecent = parseInt(rows['rows'][1]['datetime']);
    
	var difference = recent - secondrecent;
	var hoursdiff = difference / 216000;
	
	
	
	var dateArray = {};
	var currentDate = new Date(secondrecent);
	var stopDate = new Date(recent);
	while (currentDate <= stopDate) {
	    dateArray[new Date(currentDate).getTime()] = 0;
	    currentDate = currentDate.addDays(1);
	}
	
	conn.query('SELECT datetime from table_' + userid + 'WHERE datetime BETWEEN $1 AND $2',[secondrecent,recent]).on('row',function(row){
	    currentDate[datetime] = 1;
	});
	
	for (key in dateArray) {
	    if (dateArray[key] == 0) {
		missing_days.push(key);
	    }
	}
	
	
	
	
	
	
	return hoursdiff/24 + " days and " + hoursdiff % 24 + " hours";
    });
}


var missing_days = [];



////////////////////////////////////
/**
 Every time a meal is added, add missing days to data structure
 this function is called during add meal and adds all missing days to data structure
**/
function daysMissing(userid,time) {
    //first get initial entry
    conn.query('SELECT MIN(datetime) AS date from table_' + userid + ';',function(err,rows,fields) {
	var starttime;
	try {
	    starttime = parseInt(rows['rows'][0]['date']);
	}
	catch(err) {
	    return [];
	}
	//generate all time values till present day
	var start = new Date(starttime);
	var today = new Date(time);
	var days = [];
	
	
    });
}

//END AI STUFF
