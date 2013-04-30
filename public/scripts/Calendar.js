var ReqInterval = null;
var Meal = {};
window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize_cal();
	
	fatsecret.onTabChanged = function(tab_id){
			
		if(tab_id == 8)
			Customize_cal();
	};
	
	$('#fade').on('click',function(){
		document.getElementById('light').style.display='none';
		document.getElementById('fade').style.display='none';

	});
		


	// This is the part for form

		
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
			
			var delete_btn = $('<button class="delete_btn">delete</button>');
									
									//.attr('class', btn_delete);
			
			//console.log(food_servings);
			
			var foodwrapper = '<td>'+ food_type + '</td>' + 
							  '<td>'+ food_servings + '</td>' + 
							  '<td>'+ food_name +'</td>' +
							  '<td>'+ total_calories +'</td>' + 
							  '<td>' + '<button class="delete_btn">delete</button>' + '</td>'; 				 				 
			//foodwrapper.append(delete_btn);				  
			
							  
			var tofill = document.createElement('tr');
			tofill.innerHTML = foodwrapper;
			
			var table_container = document.getElementById("table_container");
			table_container.appendChild(tofill);
			
			// Add to meal object
			// TODO : Must change this...
			Meal.food.push({id : food_id, name : food_name, calories : food_calories});
			
		});
		
		$('#btn_addmeal').on('click', function(){
			
			
			console.log(Meal);
			
			serialize_meal = JSON.stringify(Meal);
			console.log(serialize_meal);
			
			var form = document.createElement("form");
			form.setAttribute("method",'post');
			form.setAttribute("action",'/addmeal');
			
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", 'meal');
			hiddenField.setAttribute("value", serialize_meal);
			
			form.appendChild(hiddenField);
			
			document.body.appendChild(form);
			form.submit();
			
			
			
			
			// Create a FormData object from out form
			/*var fd = new FormData(document.getElementById('FoodSearch'));
			fd.append('meal', serialize_meal);
			
			// Send it to the server 
			var req = new XMLHttpRequest();
			req.open('POST', '/addmeal', true);
			req.send(fd);*/
		
		});
		
		
		
		
		//$('#search_query').on('focus',show);
		//$('#search_query').on('blur',hide);
			
		/*
	$('#foodentry').on('focus',show);
		$('#foodentry').on('blur',hide);
	*/


}, false);


function transferDateToIntSetID(){
	// selector for children in order to set id 
	var daynumber = $(".fatsecret_day_number");
	var daylink = $(".fatsecret_day_link");
	var date = $("#fatsecret_output_1").text();
	// regular expression to get rid of '\n'
	var datetext = date.replace(/\n/g, '');
	var dateArray = datetext.split(' ');
	
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

function Customize_cal() {
	
	console.log("Customize");
	
	var date = new Date();
	var month = new Date().getMonth() + 1;
	var year = new Date().getFullYear();
	var text = year + "-" + month;
	
	var request = new XMLHttpRequest();

	// specify the HTTP method, URL, and asynchronous flag
	request.open('GET', '/calendar.json?date=' + text, true);

	// add an event handler
	request.addEventListener('load', function(e){
	    if (request.status == 200) {
		// do something with the loaded content
		var content = request.responseText;
		updateCalendar(JSON.parse(content));
	    } else {
		console.log('error');
		// something went wrong, check the request status
		// hint: 403 means Forbidden, maybe you forgot your username?
	    }
	}, false);

	// start the request, optionally with a request body for POST requests
	request.send(null);
	
	
	
	// in order to have the information about what date we click on, we need
	// to set id for every edit meal link. The function handles all the nessary
	// operation, for example: selector, string conversion.
	transferDateToIntSetID();

	// Change the span element's title to "Edit Meal"
	$('.fatsecret_day_content div:nth-child(1) span').html('<h4><b>+</b></h4>');	
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
}

/**
  Displays returned information on calendar
**/
function updateCalendar(data) {
    console.log(data);
    var days = $('.fatsecret_day_content');
    console.log(days);
    for (var key in data) {
	console.log(key);
	$(days[key]).append('<p mealid=' + data[key].id + '>' + data[key].mealname + ": " + data[key].totalcalories + '</p>');
    }
}

// make lightbox appear
function edit_meal(e) {
	console.log(e.currentTarget.id);
	var items = e.currentTarget.id.split('/');
	
	Meal.date = new Date(items[2],items[1]-1,items[0]-1).getTime();
	
	
	document.getElementById('light').style.display='block';
	document.getElementById('fade').style.display='block';
	// document.getElementById('table_container').innerHTML ="";
	// $('#table_container').html('<tr>
	// 		<!-- <th>Type</th> -->
	// 		<th>Food Content</th>
	// 		<th>Calories</th>
	// 	</tr>');
}





function other(e) {
	alert("Other features!");
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
		
		//if(req.status == 200)
		//{
			// Take JSON "stings" and returns the resulting Jabascript object
			//console.log("what the fuck?!");
			var content = jQuery.parseJSON(req.responseText);
			RefreshResult(content);	
			
		//}
		
	});  
	req.send(null);
	
	// stop the timer
	clearInterval(ReqInterval);
}


function RefreshResult(content) {
	
	$('#results').html("");
	
	var n = content.total_results > 10 ? content.max_results : content.total_results;
	
	// If have time, deal with edge case with only one result
	for(var i = 0 ; i < n ; i++)
	{
		// 
		var inner_html = (n == 1) ? content.food.food_name : content.food[i].food_name
		
		$('#results').append($('<div></div')
					  .html(inner_html)
					  .on('click', handlerGen(content.food[i].food_id, 
					                          content.food[i].food_name,
					                          content.food[i].food_description))
					  );	
		
	}
}

function handlerGen(id, name, dsp) {
	
	return function() {
		
		var Re = /\d+kcal/;
		var arr = Re.exec(dsp);
		var calories = parseInt(arr[0]);
		
		//console.log(id);
		//console.log(name);
		//console.log(parseInt(arr[0]));
		
		$('#search_query').val(name);
		$('#calories_field').val(calories);
		$('#foodid').val(id);

	}
}

