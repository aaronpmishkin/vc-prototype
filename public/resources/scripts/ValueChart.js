/*
* @Author: aaronmishkin
* @Date:   2016-05-05 14:14:04
* @Last Modified by:   aaronmishkin
* @Last Modified time: 2016-05-06 09:48:53
*/

function ValueChart(dataLocation) {

	this.dataLocation = dataLocation;
	this.data = [];
	this.colors = {};

	this.graphSpace = {};
	this.stackedBarChart = {};
	this.stackedBars = {};
	this.utilityCharts = {};
	this.utilityBars = {};

	var _this = this;

	d3.csv(this.dataLocation, function(error, rows) {
		_this.data = rows;
		_this.initChartColors();
		_this.plotChart();
	});
}

ValueChart.prototype.configuration = {
	chartHeight: 1000,
	chartWidth: 1000,
	barXOffset: 150,
	barWidth: 20,
	alternativeSpacing: 50,
	textYOffset: 300,
	textXOffset: 60
}

ValueChart.prototype.plotChart = function() {

	var _this = this;

	this.graphSpace = d3.select('#chart')
		.attr("width", this.configuration.chartWidth)
		.attr("height", this.configuration.chartHeight);

	this.stackedBarChart = this.graphSpace.append('g');

	this.stackedBars = this.stackedBarChart.selectAll('g')
		.data(this.data)
		.enter().append("g")
			.attr("transform", function(d, i) {return "translate(" + ((_this.configuration.barWidth * i) + _this.configuration.barXOffset) + ",100)";});


	this.utilityCharts = this.graphSpace.append('g')
		
	this.utilityBars = this.utilityCharts.selectAll('g')
		.data(this.data)
		.enter().append("g")
			.attr("transform", function(d, i) {return "translate(" + ((_this.configuration.barWidth * i) + _this.configuration.barXOffset) + ", 300)";});


	this.plotIndividualAlternatives();
	this.plotStackBarChart();
}

ValueChart.prototype.initChartColors = function() {
	this.colors = Object.assign({}, this.data[0]);
	for (field in this.colors) {
		this.colors[field] = this.getRandomColor();
	}
}

ValueChart.prototype.plotIndividualAlternatives = function() {
	var _this = this;

	var i = this.data.length - 1;
	for (var field in this.data[0]) {

		if (field !== "alternative") {
			this.utilityBars.append("rect")
				.attr("height", function(d) { return d[field]; })
				.attr("width", this.configuration.barWidth - 1)
				.attr("y", function(d) { return (i * _this.configuration.alternativeSpacing) - d[field];})
				.attr("fill", function(d) {return _this.colors[field]});

			this.utilityCharts.append("text")
				.text(function(d) { return field; })
				.attr("x", this.configuration.textXOffset)
				.attr("y", function(d) { return (i * _this.configuration.alternativeSpacing) + _this.configuration.textYOffset;})
				.attr("fill", "black");
		}
	i--;
	}
}

ValueChart.prototype.plotStackBarChart = function() {
	var _this = this;

	var columnBaseHeight = {};

	for (var i = this.data.length - 1; i >= 0; i--) {
		columnBaseHeight[this.data[i].alternative] = this.configuration.barXOffset;
	}

	for (var field in this.data[0]) {

		if (field !== "alternative") {

			this.stackedBars.append("rect")
			    .attr("height", function(d) { return (d[field]); })
				.attr("width", this.configuration.barWidth - 1)
				.attr("y", function(d) {
					columnBaseHeight[d.alternative] = columnBaseHeight[d.alternative] - d[field];
					return columnBaseHeight[d.alternative]; 
				})
				.attr("fill", function(d) {return _this.colors[field]});
		} else {
			this.stackedBars.append("text")
				.text(function(d) { return d[field]; })
				.attr("transform", "rotate(-90)")
				.attr("y", function(d,i) { return (i) + _this.configuration.barWidth / 2; })
				.attr("x", -30)
				.attr("fill", "black");
		}
	}

}

ValueChart.prototype.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
