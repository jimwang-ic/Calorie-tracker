

window.addEventListener('load', function(){
	var date = new Date(), y = date.getFullYear(), m = date.getMonth();
	start = new Date(y, m, 1);
	end = new Date(y, m + 1, 0);
	load_graph(start,end);
	
	
}, false);


function load_graph(start,end) {
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    if (start == null) {
	start = new Date(y, m, 1);
    }
    if (end == null) {
	end = new Date(y, m + 1, 0);
    }


  var data = {};
  // create a request object
  var request = new XMLHttpRequest();
  

  // specify the HTTP method, URL, and asynchronous flag
  request.open('GET', '/graph.json?start=' + start.getTime() + "&end=" + end.getTime(), true);

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
  $.plot("#placeholder", [],{});

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
  $("#placeholder").bind("plotclick", function (event, pos, item) {
    if (item) {
	plot.unhighlight();
        plot.highlight(item.series, item.datapoint);
	var values = item.datapoint.toString().split(',');
	var date = new Date(parseInt(values[0]));
	console.log('filling');
	console.log(pointToId[item.datapoint]);
	fill_date_screen(pointToId[item.datapoint]);
    	if (item.selected) {
    	  item.selected = true;
    	  plot.highlight(item.series, item.datapoint);
    	  
    	}
    }
  });
  
  // insert checkboxes 
  var choiceContainer = $("#choices");
  choiceContainer.empty();
  $.each(datasets, function(key, val) {
	  choiceContainer.append("<br/><input type='checkbox' name='" + key +
		  "' checked='checked' id='id" + key + "'></input>" +
		  "<label for='id" + key + "'>"
		  + val.label + "</label>");
  });
  
  

  choiceContainer.find("input").click(plotAccordingToChoices);
  
  
  // insert datepickers
  $("#start").datepicker();
  $("#end").datepicker();
  console.log("dates");
  console.log(new Date(start));
  console.log(new Date(end));
  $("#start").datepicker("setDate",start);
  $("#end").datepicker("setDate",end);
  $("#start").change(function() {
      start = $("#start").datepicker("getDate");
      load_graph(start,end);
  });
  $("#end").change(function() {
      end = $("#end").datepicker("getDate");
      load_graph(start,end);
  });
  console.log($("#end").datepicker("getDate"));
  

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
       legend: {show: true}, 
       yaxis: { min: 0 }, 
       xaxis: {mode: "time", timeformat: "%m-%d",min:$("#start").datepicker("getDate"),max:$("#end").datepicker("getDate")}, 
       series: {
        lines: { show: true }, points: { show: true } },
       grid: { hoverable: true, clickable: true }};

		  plot = $.plot("#placeholder", data,properties);
	  }
  };
  plotAccordingToChoices();

}
