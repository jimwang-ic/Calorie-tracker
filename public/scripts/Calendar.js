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
		
}, false);


function Customize_cal() {
	
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


// make lightbox appear
function edit_meal(e) {	
	document.getElementById('light').style.display='block';
	document.getElementById('fade').style.display='block';
}


function other(e) {
	alert("Other features!");
}
