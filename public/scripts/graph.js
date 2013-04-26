window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize(0,100000000000);
	
	
}, false);


function Customize(user,start,end) {


  //FAKE DATA!
  /*var calories = new Array();
  var daily = 300;
  for (var i = 1; i <= 30; i++) {
    calories.push([i, daily]);
    daily--;
  }
  
  var weight = new Array();
  for (var i = 1; i<= 30; i++) {
    weight.push([i,Math.floor(Math.random()*(200-190+1)+190)]);
  }*/

  var data = {};
  // create a request object
  var request = new XMLHttpRequest();

  // specify the HTTP method, URL, and asynchronous flag
  request.open('GET', 'http://www.example.com/content.json', true);

  // add an event handler
  request.addEventListener('load', function(e){
      if (request.status == 200) {
          // do something with the loaded content
          var content = request.responseText;
      } else {
          // something went wrong, check the request status
          // hint: 403 means Forbidden, maybe you forgot your username?
      }
  }, false);

  // start the request, optionally with a request body for POST requests
  request.send(null);

  calories = data['food'];
  weight = data['weight'];

  console.log('calories');
  console.log(calories);
  
  
  var datasets = {"calories": {data:calories,yaxis:1,label:"Calories Consumed"},"weight":{data:weight,yaxis:2,label:"Weight"}};

  $("#placeholder").bind("plotclick", function (event, pos, item) {
    if (item) {
	plot.unhighlight();
        plot.highlight(item.series, item.datapoint);
        alert("You clicked a point! " + item.datapoint);
	if (item.selected) {
	  item.selected = true;
	  plot.highlight(item.series, item.datapoint);
	  
	}
    }
  });
  
  // insert checkboxes 
  var choiceContainer = $("#choices");
  $.each(datasets, function(key, val) {
	  choiceContainer.append("<br/><input type='checkbox' name='" + key +
		  "' checked='checked' id='id" + key + "'></input>" +
		  "<label for='id" + key + "'>"
		  + val.label + "</label>");
  });

  choiceContainer.find("input").click(plotAccordingToChoices);

  function plotAccordingToChoices() {

	  var data = [];

	  choiceContainer.find("input:checked").each(function () {
		  var key = $(this).attr("name");
		  if (key && datasets[key]) {
			  data.push(datasets[key]);
		  }
	  });

	  if (data.length > 0) {
		  $.plot("#placeholder", data, { xaxes: [ { position: "top" } ],yaxes: [ { }, { position: "right", min: 20 } ],legend: {show: true}, yaxis: { max: 300 }, xaxis: {min:0, max:30}, series: { lines: { show: true }, points: { show: true } },grid: { hoverable: true, clickable: true }});
	  }
  };
  plotAccordingToChoices();

}