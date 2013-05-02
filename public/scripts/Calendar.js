var ReqInterval = null;
var Meal = {};
var current_month_data = {};
window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize_cal();
	
	fatsecret.onTabChanged = function(tab_id){
		//change from analysis to calendar
		if(tab_id == 8)
			Customize_cal();
	};
	
	$('#fade').on('click',function(){
		document.getElementById('light').style.display='none';
		document.getElementById('fade').style.display='none';
		document.getElementById('chooseMeal').style.display='block';
		document.getElementById('detailedForm').style.display='none';
		// Show today's calorie infomation
		var today = $('.fatsecret_day_today > span').text();
		ShowMealInfo(parseInt(today));
	});
			
	$('#next').on('click',function(){
		document.getElementById('chooseMeal').style.display='none';
		document.getElementById('detailedForm').style.display='block';
	});
	

	$('#showYesterday').on('click',function(){
		console.log("show!!!");
		addYesterDayMeal();
	});



	Form_eventListener();
	
	$('#prevMonth a,#nextMonth a').on('click',function() {
	    Customize_cal();
	});
	

		
}, false);

// Refresh calendar and clean up the form after adding meal
function RefreshCal() {
	
	Meal.food = [];
	
	$('#foodid').val("");
	$('#search_query').val("");
	$('#calories_field').val("");
	$('#fruit_servings').val("");
	$('#breakfast').prop('checked', true);
	$('#results').html("");
	$('#table_container tr:gt(0)').remove();
	
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
	document.getElementById('chooseMeal').style.display='block';
	document.getElementById('detailedForm').style.display='none';
	
	updateCalendar_ajax();
	load_graph(null,null);
}

// hashtable for hashing text to numbers
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
	    
    
	    $("#box-table-a tr td:nth-child(2)").html("Unrecorded");
	    $("#box-table-a tr td:nth-child(3)").html("n/a");
	    
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
		    }
		    
		    CombineMeal[mealtype_n].calories += meal.totalcalories;  
		    CombineMeal[mealtype_n].names += (meal.mealname + ',');
    }
    
    for(key in CombineMeal)
    {
	    var mealnames = CombineMeal[key].names;
	    $("#box-table-a tr:eq(" + key + ") td:eq(1)").html(mealnames.substring(0, mealnames.length-1));
		    $("#box-table-a tr:eq(" + key + ") td:eq(2)").html(CombineMeal[key].calories);
    }
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
			console.log("cal_ajax" + content);
			updateCalendar(JSON.parse(content));
			
			// Show today's calorie infomation
			var today = $('.fatsecret_day_today > span').text();
			var meals = current_month_data[today];
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
    
    console.log("Calendar data" +  data);
    
    //assign the data to global variable current_month_data
    current_month_data = data;
    
    var days = $('.fatsecret_day_content');
    $('.fatsecret_day_content > p, .calories').remove();

    for (var key in data) {
	var item = days[key-1];
	//$(item).empty();
	var calories = 0;
	for (var i = 0; i < data[key].length; i++) {
	    //console.log(data
	    calories += parseInt(data[key][i].totalcalories);
	}
	$(item).append('<span class=calories>' + calories + '</span>');
    }
}

// make lightbox appear
function edit_meal(e) {
	console.log(e.currentTarget.id);
	var items = e.currentTarget.id.split('/');
	
	Meal.date = new Date(items[2],items[1]-1,items[0]).getTime();
	

	document.getElementById('light').style.display='block';
	document.getElementById('fade').style.display='block';
	// document.getElementById('table_container').innerHTML ="";
	// $('#table_container').html('<tr>
	// 		<!-- <th>Type</th> -->
	// 		<th>Food Content</th>
	// 		<th>Calories</th>
	// 	</tr>');
}





var myHash = {}; // New object
	myHash['Breakfast'] = [];
	myHash['Lunch'] = [];
	myHash['Dinner'] = [];
	myHash['Snack'] = [];
	myHash['Beverage'] = [];


function hide(){
	$('#results_wrapper').hide();
}

function show(){
	console.log("called");
	$('#results_wrapper').show();
}


function showResult(data){
	var queryResults = document.getElementById(q_results);
	// This is a proto type depends on what kind of data is passed
	// from the server
	for(var i=0; i<data; i++){
		var entry = document.createElement('div');
		entry.innerHTML = data[i];
		queryResults.appendChild(entry);
	}
}


function saveFormValue (event) {
 	// alert("you clicked my link!");
 	var food = document.getElementById("foodentry").value;
 	var type = document.getElementById("meal_type").value;
 	
 	
 	if(myHash.hasOwnProperty(type)){
 			myHash[type] = myHash[type] + food+" ";
 	}

 	// split the string with the regular expression, need to check with user input in the future
 	
 	var foodArr = food.split(' +');
	var typehtml = document.getElementById(type);

 	if(food !==""){
 		if(typehtml == null){
	 		var typewrapper = '<td id='+type+'>'+type+'</td>';
	 		var foodwrapper = '<td id='+type+'_content>'+food+'</td>';
			var tofill = document.createElement('tr');
	 		tofill.innerHTML = typewrapper + foodwrapper;
	 		var table_container = document.getElementById("table_container");
	 		table_container.appendChild(tofill);
	 	}else{
	 		var toquery = type +"_content";
	 		var foodcontenthtml = document.getElementById(toquery);
	 		foodcontenthtml.innerHTML = myHash[type];
	 	}
 	}

 	// console.log(table_container);
 	// console.log(type);
 	// console.log(food);
}


function getResult () {
	
	//e.preventDefault();
	console.log($('#search_query').val());
	
	var req = new XMLHttpRequest();
	req.open('GET', '/searchFood.json?food=' + $('#search_query').val() );
	req.addEventListener('load', function(){
		
		if(req.status == 200)
		{
			// Take JSON "stings" and returns the resulting Jabascript object
			var content = jQuery.parseJSON(req.responseText);
			console.log("content");
			console.log(content);
			RefreshResult(content,false);	
			
		}
		else
		{
			console.log("check Calendar.js");
		}
		
	});  
	req.send(null);
	
	// stop the timer
	clearInterval(ReqInterval);
}


function RefreshResult(content,yesterday) {
	
	$('#results').html("");
	
	// This happened where we are using yesterday meal
	if(yesterday == true){

		var n = content.total_results > 10 ? content.max_results : content.total_results;
		console.log("n:"+n);
		console.log(content);
		console.log(content.name);

		/*
			Bug here, when only 1 object, I will have object has no method on
		*/
		for(var i = 0 ; i < n ; i++)
		{
			console.log(content.name);
			console.log(content[i].name);
			
			var inner_html = content[i].name//(n == 1) ? content.name : content[i].name;
			//console.log(content[i].id+" "+content[i].name+" "+content[i].calories);
			console.log(inner_html);
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
			console.log("id:"+id);
			console.log("name:"+name);
			console.log("dsp:"+dsp);

			var Re = /\d+kcal/;
			var arr = Re.exec(dsp);
			console.log(arr);
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
	
	
	$('#saveInJavaScript').on('click', saveFormValue);
	
	$('#FoodSearch').on('submit', function(e){
		e.preventDefault();
	
	});
	$('#search_query').on('keyup', function(){
		// A Hack way to make a request to server with delay : 250 miliseconds.
		//console.log("keyup!");
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
		
		//var delete_btn = $('<button class="delete_btn">x</button>');
								
				
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
		Meal.food.push({id : food_id, name : food_name, calories : total_calories, mealtype: food_type});
		
	});
	
	$('#btn_addmeal').on('click', function(){
		
		console.log(Meal);
		
		serialize_meal = JSON.stringify(Meal);
		console.log(serialize_meal);
		
		
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
}

function addYesterDayMeal(){
	if(Meal.date != undefined){
		var date = new Date(Meal.date).getDate();
		var food_type = $('#mealType input:radio:checked').val();
		var yesterdayMeal =[];
		if(current_month_data.hasOwnProperty(date-1)){
			// This will return the arrays of the food yesterday 
			var foodYesterday = current_month_data[date-1];
			var food = document.createElement("div");
			for(var i=0; i<foodYesterday.length; i++){

				console.log("radio:"+food_type);
				console.log("table:"+foodYesterday[i].mealtype);
				console.log("Yesterday");
				console.log(foodYesterday[i]);

				if(foodYesterday[i].mealtype == food_type){
					// yesterdayMeal foodYesterday[i].mealname+'\n';
					yesterdayMeal.push({id : foodYesterday[i].foodid, name : foodYesterday[i].mealname, calories : foodYesterday[i].totalcalories, 
						mealtype: foodYesterday[i].mealtype});

				}

			}
			yesterdayMeal['total_results'] = foodYesterday.length;
			yesterdayMeal['max_results'] = 10;
		}
		console.log(yesterdayMeal);
		console.log("call refresh results");
		RefreshResult(yesterdayMeal,true);
		// $("#yesterdayMealContent").html(totalmeal);

	}


	return;
}

