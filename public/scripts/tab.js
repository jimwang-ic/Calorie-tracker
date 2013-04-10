/*	alert("loaded hsit");

window.addEventListener('onload',function(){
alert('testTABE');
		},false);
*/

 $(document).ready(function(){
 	//alert('test_tab');
 	
	$('.tab').click(function(){
		$('#tabs_container > .tabs > li.active')
			.removeClass('active');

		$(this).parent().addClass('active');

		$('#tabs_container > .tab_contents_container > div.tab_contents_active')
			.removeClass('tab_contents_active');

	$(this.rel).addClass('tab_contents_active');

	});
}); 
