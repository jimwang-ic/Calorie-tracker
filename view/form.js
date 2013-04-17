
window.addEventListener('load', function(){
	


	$('#saveInJavaScript').on('click', saveFormValue);

		
}, false);


function saveFormValue (event) {
 	// alert("you clicked my link!");
 	var food = document.getElementById("foodentry").value;
 	var type = document.getElementById("meal_type").value
 	// split the string with the regular expression, need to check with user input in the future
 	var foodArr = food.split(' ');
 	
 	var typewrapper = '<td>'+type+'</td>';
 	var foodwrapper = '<td>'+food+'</td>';
	var tofill = document.createElement('tr');
 	tofill.innerHTML = typewrapper + foodwrapper;
 	var table_container = document.getElementById("table_container");
 	table_container.appendChild(tofill);
 	console.log(table_container);
 	console.log(type);
 	console.log(food);
}