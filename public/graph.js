window.addEventListener('load', function(){
	
	// Customize our Calendar  
	Customize();
	
		
}, false);

function Customize() {
  //plot calories
  var calories = new Array();
  var daily = 300;
  for (var i = 1; i <= 30; i++) {
    calories.push([i, daily]);
    daily--;
  }
  
  var weight = new Array();
  for (var i = 1; i<= 30; i++) {
    weight.push([i,Math.floor(Math.random()*(200-190+1)+190)]);
  }
  console.log(calories);
  var plot = $.plot($("#placeholder"), [{data:calories,yaxis:1,label:"Calories Consumed"},{data:weight,yaxis:2,label:"Weight"}], { xaxes: [ { position: "top" } ],yaxes: [ { }, { position: "right", min: 20 } ],legend: {show: true}, yaxis: { max: 300 }, xaxis: {min:0, max:30}, series: { lines: { show: true }, points: { show: true } },grid: { hoverable: true, clickable: true }});
  //var weightgraph = $.plot($("#weight"), [weight], { legend: {show: true}, yaxis: { max: 300 }, xaxis: {min:0, max:30}, series: { lines: { show: true }, points: { show: true } },grid: { hoverable: true, clickable: true }});
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
  
}