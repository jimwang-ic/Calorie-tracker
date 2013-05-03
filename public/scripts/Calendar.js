var ReqInterval = null;
var Meal = {};
var current_month_data = {};

var DEFAULT_DAILY_CALORIES = 2000;
var DEFAULT_DAILY_MEAL = 550;
var DEFAULT_DAILY_SNACK = 150;

window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize_cal();
	
	fatsecret.onTabChanged = function(tab_id){
		//change from analysis to calendar
		if(tab_id == 8)
			Customize_cal();
	};
	
	$('#fade').on('click',function(){
				
		// Show today's calorie infomation on detail panel
		var today = $('.fatsecret_day_today > span').text();
		var meals = current_month_data[today];
		fill_date_screen(meals);
		RefreshCal();
		
	});
			
	$('#next_choosemeal').on('click',function(){
	
		if( $('#auto_gen:checked').prop("checked") )
		{
			alert("auto generate!");
		}
		else
		{
			document.getElementById('chooseMeal').style.display='none';
			document.getElementById('detailedForm').style.display='block';
		}
	});
	
	$('#next_optionselect').on('click',function(){
		
		if( $('#addMeal:checked').prop("checked") )
		{
			document.getElementById('optionSelect').style.display='none';
			document.getElementById('chooseMeal').style.display='block';
			document.getElementById('detailedForm').style.display='none';
		}
		else
		{
			document.getElementById('optionSelect').style.display='none';
			document.getElementById('weightInput').style.display='block';
		}
		
	});
	
	$('#next_autogenDialog').on('click', function(){
		
		if( $('#yes_auto:checked').prop("checked") )
		{	
			console.log("============== Date ==================")
			console.log(Meal.date);
			automaticMeal("AUTO",Meal.date);	
			console.log("AutoGenerate");
			fadeout();
		}
		else
		{
			document.getElementById('autogenDialog').style.display='none';
			document.getElementById('optionSelect').style.display='block';
			document.getElementById('chooseMeal').style.display='none';
			document.getElementById('detailedForm').style.display='none';
			console.log("No!!");
		}
	});
	
	Form_eventListener();
			
}, false);

// Refresh calendar and clean up the form after adding meal
function RefreshCal() {
	
	var temp_date = Meal.date;
	Meal = {};
	Meal.food = [];
	Meal.date = temp_date;
	
	$('#foodid').val("");
	$('#search_query').val("");
	$('#calories_field').val("");
	$('#fruit_servings').val("");
	$('#breakfast').prop('checked', true);
	$('#results').html("");
	$('#table_container tr:gt(0)').remove();
	$('#weight_input').val("");
	
	fadeout();
	updateCalendar_ajax();
	load_graph(null,null);
}


function fadeout() {
	
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
	document.getElementById('autogenDialog').style.display='none';
	document.getElementById('optionSelect').style.display='block';
	document.getElementById('chooseMeal').style.display='none';
	document.getElementById('detailedForm').style.display='none';
	document.getElementById('weightInput').style.display='none';
	
}
// Hashtable for hashing text to numbers
var monthTable = {
	'January':'01',
	'February':'02',
	'March':'03',
	'April':'04',
	'May':'05',
	'June':'06',
	'July':'07',
	'August':'08',
	'September':'09',
	'October':'10',
	'November':'11',
	'December':'12'
};
	

/**
  Sets id within span of "+" for access to query backend.
**/
function transferDateToIntSetID(){
	// selector for children in order to set id 
	var daynumber = $(".fatsecret_day_number");
	var daylink = $(".fatsecret_day_link");
	var date = $("#fatsecret_output_1").text();
	// regular expression to get rid of '\n'
	var datetext = date.replace(/\n/g, '');
	var dateArray = datetext.split(' ');
	

	// set id for edit meal link
	for(var i=0; i<daylink.length/2; i++){
		var id = daynumber[i].innerHTML;
		if(id.length == 1){
			id = '0'+id;
			console.log(id);
		}
		// set id
		daylink[2*i].setAttribute("id",id+'/'+monthTable[dateArray[0]]+'/'+dateArray[1]);	
	}
}



/**

  Main function for setting up calendar.

**/
function Customize_cal() {
	
	updateCalendar_ajax();

	// in order to have the information about what date we click on, we need
	// to set id for every edit meal link. The function handles all the nessary
	// operation, for example: selector, string conversion.
	transferDateToIntSetID();

	// Change the span element's title to "Edit Meal"
	$('.fatsecret_day_content div:nth-child(1) span').html('<span id="plus_btn">+</span>');	
	// remove the original onclick function
	$('.fatsecret_day_content div:nth-child(1) a').removeAttr('onclick');
	// bind our customize click event
	$('.fatsecret_day_content div:nth-child(1) a span').on('click', edit_meal);
	
	/*$('.fatsecret_day_content div').remove();
	$('.fatsecret_day_other').append('<span id="plus"><a href="#">+<a/></span>');*/
	
	//test
	//$('.fatsecret_day_content div:nth-child(1) a').attr('id',"123");
	
	// Change the span element's title to "Other features"
	/*$('.fatsecret_day_content div:nth-child(2) span').html('<b>Other features</b>')	
	// remove the original onclick function
	$('.fatsecret_day_content div:nth-child(2) a').removeAttr('onclick');
	// bind our customize click event
	$('.fatsecret_day_content div:nth-child(2) a').on('click', other);*/
	
	//removed other features, shouldn't be in this
	$('.fatsecret_day_content div:nth-child(2)').remove();

	// Hide the fat secret api logo
	$('.fatsecret_footer').hide();
	
	
	$('.fatsecret_day_other, .fatsecret_day_today').click(function(e) {
        	
        if ($(e.target).is('.fatsecret_day_content span')) 
        {
            return;
        }
        else 
        {
		    var id = $(e.target).find( $('a span') ).attr('id');
		    try {
				var day = id.split("/");
				var date = parseInt(day[0],10);
				var meals = current_month_data[date];
				fill_date_screen(meals);
		    }
		    catch (error) {
				clear_date_screen();
		    } //blank day

        }
	});
	
	
}

function clear_date_screen() {
    $("#box-table-a tr td:nth-child(2)").html("Unrecorded");
    $("#box-table-a tr td:nth-child(3)").html("n/a");
    $("#box-table-a tr").unbind();
}

//id mealname mealtype totalcalories
function fill_date_screen(meals) {
   
    //console.log(meals);
    
    var mealtypeTable = {
		    'breakfast': 1,
		    'lunch':2,
		    'dinner':3,
		    'snack':4
	    };  
	    
	    clear_date_screen();
	    
	    // Combine the meals base on their types
	    var CombineMeal = {};
	    
	    for(var key in meals)
	    {
		    var meal = meals[key];
		    var mealtype_n =  mealtypeTable[meal.mealtype];
		    
		    if(CombineMeal[mealtype_n] === undefined)
		    {
			    CombineMeal[mealtype_n] = {};
			    CombineMeal[mealtype_n].names = "";
			    CombineMeal[mealtype_n].calories = 0;
			    CombineMeal[mealtype_n].ids = [];
		    }
		    
		    CombineMeal[mealtype_n].calories += meal.totalcalories;  
		    CombineMeal[mealtype_n].names += (meal.mealname + ',');
		    CombineMeal[mealtype_n].ids.push(meal.id);
    }
    
    for(key in CombineMeal)
    {
	    var mealnames = CombineMeal[key].names;
	    $("#box-table-a tr:eq(" + key + ")").unbind();
	    $("#box-table-a tr:eq(" + key + ")").on('click', editMeal(CombineMeal[mealtype_n].ids ));
	    $("#box-table-a tr:eq(" + key + ") td:eq(1)").html("Recorded");
		$("#box-table-a tr:eq(" + key + ") td:eq(2)").html(CombineMeal[key].calories);
    }
}

function editMeal(ids) {
	return function(){
		
		Meal.ids = [];
		
		for(var keys in ids)
		{
			queryMeal(ids[keys]);
		}
		
		document.getElementById('light').style.display='block';
		document.getElementById('fade').style.display='block';
		document.getElementById('optionSelect').style.display='none';
		document.getElementById('chooseMeal').style.display='none';
		document.getElementById('detailedForm').style.display='block';
	}
	
}

function queryMeal(id) {

	$.ajax({
		type: "GET",
		url: "/entry.json",
		data: "id=" + id,
		success: function(msg)
		{
			var content = msg;
			var foodids = content.food;	
			var mealtype = content.mealtype;
			var servings = content.servings;
			
			//console.log(content);
			for(var key in foodids)
			{
				var servings_cal = servings[key].split("*");
				//console.log(foodids[key]);
				getFood(foodids[key],mealtype,servings_cal[0],servings_cal[1]);	
			}
			
			Meal.ids.push(id);
		},
		error: function()
		{
			console.log("error");	
		}
	});
	
}

function getFood(foodid,mealtype,servings,calories) {
	
	
	$.ajax({
        type: "GET",
        url: "/getFood.json",
        data: "foodid="+ foodid,
        success: function(msg)
        {
        	var food = jQuery.parseJSON(msg);
            //console.log(food);
            //console.log(food.servings);
            var total_calories = parseInt(calories,10)*parseInt(servings,10);
            var foodwrapper = '<td>'+ mealtype + '</td>' + 
							  '<td>'+ servings + '</td>' + 
							  '<td>'+ food.food_name +'</td>' +
							  '<td>'+ total_calories +'</td>' + 
							  '<td>' + '<button class="delete_btn">x</button>' + '</td>' + 
							  '<td class="foodID" style = "display:none">' + foodid + '</td>'; 				 				 
										  
			var tofill = document.createElement('tr');
			tofill.innerHTML = foodwrapper;
			
			var table_container = document.getElementById("table_container");
			table_container.appendChild(tofill);
			
			// Add to meal object	
			Meal.food.push({id : foodid, name : food.food_name, calories : total_calories, mealtype: mealtype, servings : servings});
       
        },
        error: function()
        {
            console.log("Error!");
        }
    });
}


function updateCalendar_ajax() {
	
	var date = $("#fatsecret_output_1").text();
	// regular expression to get rid of '\n'
	var datetext = date.replace(/\n/g, '');
	var dateArray = datetext.split(' ');
	var text = dateArray[1] + "-" + monthTable[dateArray[0]];
	
	var request = new XMLHttpRequest();

	// specify the HTTP method, URL, and asynchronous flag
	request.open('GET', '/calendar.json?date=' + text, true);

	// add an event handler
	request.addEventListener('load', function(e){
	    if (request.status == 200) {
			
			// do something with the loaded content
			var content = request.responseText;
			updateCalendar(JSON.parse(content));
			
			var editmeal_date = 0;
			
			if(Meal.date === undefined)
			{
				editmeal_date = $('.fatsecret_day_today > span').text();	
			}
			else
			{
				var dateobj = new Date(Meal.date);
				editmeal_date = dateobj.getDate();	
			}
			
			var meals = current_month_data[editmeal_date];
			// Show the newest update information
			fill_date_screen(meals);
			
			
	    } else {
			console.log('error');
			// something went wrong, check the request status
			// hint: 403 means Forbidden, maybe you forgot your username?
	    }
	}, false);

	// start the request, optionally with a request body for POST requests
	request.send(null);
	
}
/**
  Displays returned information on calendar
**/
function updateCalendar(data) {
    
    //console.log("Calendar data");
    //console.log(data);
    
    //assign the data to global variable current_month_data
    current_month_data = data;
    //console.log(data);
    
    var days = $('.fatsecret_day_content');
    $('.fatsecret_day_content > p, .calories').remove();

    for (var key in data) {
	var item = days[key-1];
	//$(item).empty();
	var calories = 0;
	for (var i = 0; i < data[key].length; i++) {
	    //console.log(data
	    if(data[key][i].totalcalories != null)
	  		calories += parseInt(data[key][i].totalcalories);
	}
	if(calories != 0)
		$(item).append('<span class=calories>' + calories + '</span>');
    }
    
    var today = new Date();
    for (var i = 0; i < days.length; i++) {
	$(days[i]).parent().removeClass("missing");
    }
    for (var i = 0; i < days.length; i++) {
	if ($(days[i]).parent().attr('class') == 'fatsecret_day_today') {
	    return;
	}
	var val = i+1;
	if (!(val in data)) {
	    $(days[i]).parent().addClass("missing");
	}
    }
    
}

// make lightbox appear
function edit_meal(e) {
	
	$('#results').html("");

	//console.log(e.currentTarget.id);
	var items = e.currentTarget.id.split('/');
	//console.log(
	Meal.date = new Date(items[2],items[1]-1,items[0]).getTime();
	
	//console.log($(e.currentTarget).parents("td").attr("class"));
	
	if( $(e.currentTarget).parents("td").attr("class") == "fatsecret_day_other missing" )
	{
		document.getElementById('autogenDialog').style.display='block';
		document.getElementById('optionSelect').style.display='none';
		document.getElementById('light').style.display='block';
		document.getElementById('fade').style.display='block';
		//console.log("past date");
	}
	else
	{
		document.getElementById('light').style.display='block';
		document.getElementById('fade').style.display='block';
	}

	
	// document.getElementById('table_container').innerHTML ="";
	// $('#table_container').html('<tr>
	// 		<!-- <th>Type</th> -->
	// 		<th>Food Content</th>
	// 		<th>Calories</th>
	// 	</tr>');
}

function getResult () {
	
	//e.preventDefault();
	
	var req = new XMLHttpRequest();
	req.open('GET', '/searchFood.json?food=' + $('#search_query').val() );
	req.addEventListener('load', function(){
		
		if(req.status == 200)
		{
			// Take JSON "stings" and returns the resulting Javascript object
			var content = jQuery.parseJSON(req.responseText);
			RefreshResult(content,false);	
			
		}
		else
		{
			console.log("check Calendar.js");
		}
		
	});  
	req.send(null);
	
	// Stop the timer
	clearInterval(ReqInterval);
}


function RefreshResult(content,yesterday) {
	
	$('#results').html("");
	
	// This happened where we are using yesterday meal
	if(yesterday == true){

		var n = content.total_results > 10 ? content.max_results : content.total_results;


		/*
			Bug here, when only 1 object, I will have object has no method on
		*/
		for(var i = 0 ; i < n ; i++)
		{
			
			
			var inner_html = content[i].name//(n == 1) ? content.name : content[i].name;
			//console.log(content[i].id+" "+content[i].name+" "+content[i].calories);
			//console.log(inner_html);
			$('#results').append($('<div></div')
						  .html(inner_html)
						  .on('click', handlerGen(content[i].id, 
						                          content[i].name,
						                          content[i].calories,true))
			);	
			
		}

	}
	else{
		var n = content.total_results > 10 ? content.max_results : content.total_results;
		
		// If have time, deal with edge case with only one result
		for(var i = 0 ; i < n ; i++)
		{
			
			var inner_html = (n == 1) ? content.food.food_name : content.food[i].food_name;
			
			$('#results').append($('<div></div')
						  .html(inner_html)
						  .on('click', handlerGen(content.food[i].food_id, 
						                          content.food[i].food_name,
						                          content.food[i].food_description,false))
						  );	
			
		}
	}
}

function handlerGen(id, name, dsp, yesterday) {

	if(yesterday == false){
		return function() {
			// console.log("id:"+id);
			// console.log("name:"+name);
			// console.log("dsp:"+dsp);

			var Re = /\d+kcal/;
			var arr = Re.exec(dsp);
			//console.log(arr);
			var calories = parseInt(arr[0]);
			
			//console.log(id);
			//console.log(name);
			//console.log(parseInt(arr[0]));
			
			$('#search_query').val(name);
			$('#calories_field').val(calories);
			$('#foodid').val(id);

		}
	}else{

		return function() {
			$('#search_query').val(name);
			$('#calories_field').val(dsp);
			$('#foodid').val(id);
		}
	}
}


function Form_eventListener() {
	
	Meal.username = "username";
	
	Meal.food = [];
	
	$('#weightInput').on('submit', function(e){
		e.preventDefault();
	});
	
	$('#btn_addweight').on('click', function(e){

		Meal.food = undefined;
		Meal.weight = $('#weight_input').val();
		serialize_meal = JSON.stringify(Meal);
		
		// Create a FormData object from out form
		var fd = new FormData();
		fd.append('meal', serialize_meal);
		
		// Send it to the server 
		var req = new XMLHttpRequest();
		req.open('POST', '/addmeal', true);

		req.addEventListener('load', RefreshCal);
		req.send(fd);
		
	});
	
	$('#FoodSearch').on('submit', function(e){
		e.preventDefault();
	
	});
	$('#search_query').on('keyup', function(){
		// A Hack way to make a request to server with delay : 300 miliseconds.
		clearInterval(ReqInterval);
		ReqInterval = setInterval(function(){ getResult(); }, 300);
	});	
	
	$('#btn_additem').on('click', function(){
		
		var food_id = $('#foodid').val();
		var food_name = $('#search_query').val();
		var food_calories = $('#calories_field').val();
		var food_servings = $('#fruit_servings').val();
		var food_type = $('#mealType input:radio:checked').val();
		var total_calories = food_calories*parseInt(food_servings);
		
		var foodwrapper = '<td>'+ food_type + '</td>' + 
						  '<td>'+ food_servings + '</td>' + 
						  '<td>'+ food_name +'</td>' +
						  '<td>'+ total_calories +'</td>' + 
						  '<td>' + '<button class="delete_btn">x</button>' + '</td>' + 
						  '<td class="foodID" style = "display:none">' + food_id + '</td>'; 				 				 
	
						  
		var tofill = document.createElement('tr');
		tofill.innerHTML = foodwrapper;
		
		var table_container = document.getElementById("table_container");
		table_container.appendChild(tofill);
		
		// Add to meal object	
		Meal.food.push({id : food_id, name : food_name, calories : total_calories, mealtype: food_type, servings : food_servings});
		
	});
	
	$('#btn_addmeal').on('click', function(){
		
		//console.log("====== save to database ======");
		//console.log(Meal);
				
		serialize_meal = JSON.stringify(Meal);
		
		// Create a FormData object from out form
		var fd = new FormData();
		fd.append('meal', serialize_meal);
		
		// Send it to the server 
		var req = new XMLHttpRequest();
		req.open('POST', '/addmeal', true);

		req.addEventListener('load', RefreshCal);
		req.send(fd);
		
	});
	
	
	$('.delete_btn').live('click', function(e){
		
		var foodId = $(e.target).parent().parent().find($('.foodID')).text();
	
		for(var key in Meal.food)
		{	
			if( parseInt(Meal.food[key].id,10) === parseInt(foodId,10) )
			{
				index = key;
				break;
			}
		}
		// Delete the food in Meal object 
		Meal.food.splice(index,1);
		// Remove the element
		$(e.target).parent().parent().remove();
		
	});
	
	$('#showPrevious').on('click',function(){
		console.log("show!!!");
		addpreviousMeal();
	});

}

function addpreviousMeal(){
	if(Meal.date != undefined){
		var date = new Date(Meal.date).getDate();
		var food_type = $('#mealType input:radio:checked').val();
		var previousMeal =[];

		 for(var d =date-1; d >= date-5; d=d-1){
			
			if(current_month_data.hasOwnProperty(d)){
				// This will return the arrays of the food yesterday 
				var foodPrevious = current_month_data[d];
							
				var food = document.createElement("div");
				for(var i=0; i<foodPrevious.length; i++){

					if(foodPrevious[i].mealtype == food_type){
						// previousMeal foodPrevious[i].mealname+'\n';
						previousMeal.push({id : foodPrevious[i].foodid, name : foodPrevious[i].mealname, calories : foodPrevious[i].totalcalories, 
							mealtype: foodPrevious[i].mealtype});

					}

				}
		 }

		}

		previousMeal['total_results'] = Object.keys(previousMeal).length;
		previousMeal['max_results'] = 10;

		// console.log(previousMeal);
		// console.log("call refresh results");
		RefreshResult(previousMeal,true);
		// $("#previousMealContent").html(totalmeal);

	}


	return;
}

/**
  Takes in mealtype or calculates average across meals
  adds meal or all 4 meals for day in database
  if mealtype is AUTO, then add 4 meals into database based on a day's calories
**/

//db scheme
//(id INTEGER PRIMARY KEY, datetime INTEGER, foodweight BINARY, mealname TEXT, totalcalories INTEGER, foodid INTEGER, mealtype TEXT, weight INTEGER, servings TEXT)

/*{ food: 
   [ { id: '288333',
       name: 'American Cheese',
       calories: 337,
       mealtype: 'breakfast',
       servings: '1' } ],
  date: 1367467200000 }*/
//2000 calorie daily default
function automaticMeal(mealtype,datetime) {
    var calories = 0;
    var nummeals = 0;
    var data = current_month_data;
    if (mealtype == "AUTO") { //want to create one big meal
 	console.log(data);
	for (var day in data) {
	    var meals = data[day];
	    for (var i = 0; i < meals.length; i++) {
		var meal = meals[i];
		calories += parseInt(meal.totalcalories);
		nummeals += 1;
	    }
	}
    }
    else {
	for (var day in data) {
	    var meals = data[day];
	    for (var i = 0; i < meals.length; i++) {
		var meal = meals[i];
		if (meal.mealtype === mealtype) {
		    console.log(meal.totalcalories);
		    calories += parseInt(meal.totalcalories);
		    nummeals += 1;
		}
	    }
	}
    }
    if (calories == 0) { //there's no data points
	if (mealtype === 'snack') {
	    calories = parseInt(DEFAULT_DAILY_SNACK);
	}
	else if (mealtype === 'AUTO') {
	    calories = parseInt(DEFAULT_DAILY_CALORIES);
	}
	else {
	    calories = parseInt(DEFAULT_DAILY_MEAL);
	}
    }
    else {
	calories = parseInt(calories/nummeals);
    }
    
    
    meal = {};
    meal['food'] = [];
    toadd = {};
    toadd.id = 0;
    toadd.name = 'AUTOGENERATE';
    toadd.calories = parseInt(calories);
    toadd.mealtype = mealtype;
    toadd.servings = 1;
    meal['food'].push(toadd);
    meal['date']=datetime;
    
    
    serialize_meal = JSON.stringify(meal);
    // Create a FormData object from out form
    var fd = new FormData();
    fd.append('meal', serialize_meal);
    
    // Send it to the server 
    var req = new XMLHttpRequest();
    req.open('POST', '/addmeal', true);

    req.addEventListener('load', RefreshCal);
    req.send(fd);
    
}

