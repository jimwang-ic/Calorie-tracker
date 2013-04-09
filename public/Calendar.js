window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize();
	
	fatsecret.onTabChanged = function(tab_id){
			
		if(tab_id == 8)
			Customize();
	};
	
		
}, false);


function Customize() {
	
	console.log("Customize");
	
	// Change the span element's title to "Edit Meal"
	$('.fatsecret_day_content div:nth-child(1) span').html('<b>Edit Meal</b>');	
	// remove the original onclick function
	$('.fatsecret_day_content div:nth-child(1) a').removeAttr('onclick');
	// bind our customize click event
	$('.fatsecret_day_content div:nth-child(1) a').on('click', edit_meal);
	
	
	// Change the span element's title to "Other features"
	$('.fatsecret_day_content div:nth-child(2) span').html('<b>Other features</b>')	
	// remove the original onclick function
	$('.fatsecret_day_content div:nth-child(2) a').removeAttr('onclick');
	// bind our customize click event
	$('.fatsecret_day_content div:nth-child(2) a').on('click', other);

	// Hide the fat secret api logo
	$('.fatsecret_footer').hide();
		
}

function edit_meal(e) {
	
	alert("Edit meal!");

}


function other(e) {
	
	alert("Other features!");
	
}