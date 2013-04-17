
window.addEventListener('load', function(){
	


	$('#saveInJavaScript').on('click', saveFormValue);

		
}, false);


function saveFormValue (event) {
 	// alert("you clicked my link!");
 	var food = document.getElementById("foodentry").value;
 	console.log(food);
}