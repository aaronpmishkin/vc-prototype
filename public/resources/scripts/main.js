/*
 * @Author: aaronmishkin
 * @Date:   2016-05-04 13:57:02
 * @Last Modified by:   aaronmishkin
 * @Last Modified time: 2016-05-05 14:14:14
 */


$('#update-graph-button').click(function(eventObject) {
	console.log(eventObject);
	var dataLocation = $('#URI-input').val();

	var valueChart = new ValueChart(dataLocation);
});

var valueChart = new ValueChart("http://localhost:3000/resources/data/sample-data.csv");



