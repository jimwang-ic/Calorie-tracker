window.addEventListener('load', function(){
	
	// Customize our Calendar  
	//for now april 2013
	var start = new Date(2013,3,1).getTime();
	var end = new Date(2013,4,0).getTime();
	console.log("between " + start + " " + end);
	Customize("username",start,end);
	
	
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
  request.open('GET', '/graph.json?start=' + start + "&end=" + end, true);

  // add an event handler
  request.addEventListener('load', function(e){
      if (request.status == 200) {
          // do something with the loaded content
          var content = request.responseText;
          update(JSON.parse(content));
      } else {
        console.log('error');
          // something went wrong, check the request status
          // hint: 403 means Forbidden, maybe you forgot your username?
      }
  }, false);

  // start the request, optionally with a request body for POST requests
  request.send(null);
}

function update(data) {

  calories = data['food'];
  weight = data['weight'];

  console.log('calories');
  console.log(calories);
  
  //eventually try to map datapoint to object ID!
  pointToId = {};
  for (var i = 0; i < calories.length; i++) {
      var entry = calories[i];
      pointToId[entry[0] + "," + entry[1]] = entry[2];
  }
  console.log(pointToId);
  
  var datasets = {"calories": {data:calories,yaxis:1,label:"Calories Consumed"},"weight":{data:weight,yaxis:2,label:"Weight"}};
  var plot; //defined below when its plotted
  $("#placeholder").bind("plotclick", function (event, pos, item) {
    if (item) {
	plot.unhighlight();
        plot.highlight(item.series, item.datapoint);
	var values = item.datapoint.toString().split(',');
	var date = new Date(parseInt(values[0]));
	console.log(item.datapoint);
        //alert("You clicked a point!  On " + date + " you ate " + values[1] + " calories.  Also " + pointToId[item.datapoint]);
	// create a request object
	var request = new XMLHttpRequest();

	// specify the HTTP method, URL, and asynchronous flag
	request.open('GET', '/entry.json?id=' + pointToId[item.datapoint], true);

	// add an event handler
	request.addEventListener('load', function(e){
	    if (request.status == 200) {
		// do something with the loaded content
		var content = request.responseText;
		alert(content); //pull up edit meal window!
	    } else {
		console.log('error');
		// something went wrong, check the request status
		// hint: 403 means Forbidden, maybe you forgot your username?
	    }
	}, false);

	// start the request, optionally with a request body for POST requests
	request.send(null);
	
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

      var properties =  {
       xaxes: [ { position: "top" } ],
       yaxes: [ { }, { position: "right", min: 20 } ],
       legend: {show: true}, //yaxis: { min: 0, max: 3000 }, 
       xaxis: {mode: "time", timeformat: "%m-%d"}, 
       series: {
        lines: { show: true }, points: { show: true } },
       grid: { hoverable: true, clickable: true }};

		  plot = $.plot("#placeholder", data,properties);
	  }
  };
  plotAccordingToChoices();

}
