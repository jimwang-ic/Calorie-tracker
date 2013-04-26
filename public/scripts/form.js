
window.addEventListener('load', function(){
	


	$('#saveInJavaScript').on('click', saveFormValue);
	$('#foodentry').on('focus',show);
	$('#foodentry').on('blur',hide);
	
}, false);

var myHash = {}; // New object
	myHash['Breakfast'] = [];
	myHash['Lunch'] = [];
	myHash['Dinner'] = [];
	myHash['Snack'] = [];
	myHash['Beverage'] = [];


function hide(){
	$('#q_results_container').hide();
}

function show(){
	console.log("called");
	$('#q_results_container').show();
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