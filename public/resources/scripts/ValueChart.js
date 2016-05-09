/*
* @Author: aaronmishkin
* @Date:   2016-05-05 14:14:04
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-05-09 16:56:06
*/

function ValueChart(dataLocation) {

	this.dataLocation = dataLocation;
	this.data = [];
	this.alternativeLabels = [];

	this.graphSpace = {};
	this.stackedBarChart = {};
	this.stackedBars = {};
	this.utilityCharts = {};
	this.utilityBars = {};

	var _this = this;

	d3.csv(this.dataLocation, function(d) {
		if (!_this.objectiveLabels) {
			_this.objectiveLabels = d3.keys(d);
			_this.objectiveLabels.splice(0, 1);
		}

		return d3.values(d);
		
	}, function(error, rows) {

		_this.data = rows[0].map(function(col, colIndex) { 
			return rows.map(function(row, rowIndex) { 
				if (colIndex == 0) {
					_this.alternativeLabels.push(row[colIndex]);
				}
				return {x: rowIndex, y: +row[colIndex]}; 
			})
		});


		_this.data.splice(0, 1);
		_this.layers = _this.data.length;
		_this.elements = _this.data[0].length;

		_this.color = d3.scale.linear()
    		.domain([0, _this.elements - 1])
    		.range(['#00F0FF', '#FF0000']);

		_this.plotChart();
	});
}

ValueChart.prototype.configuration = {
	chartHeight: 1000,
	chartWidth: 400,
	barWidth: 20,
	objectiveSpacing: 80,
	textXOffset: 10
}


ValueChart.prototype.plotChart = function() {
	var _this = this;

	this.graphSpace = d3.select('#chart')
		.attr('width', this.configuration.chartWidth)
		.attr('height', this.configuration.chartHeight);

	this.stackedBarChart = this.graphSpace.append('g')
		.attr('transform', 'translate(' + (this.configuration.chartWidth / 5) + ', 100)');

	this.utilityCharts = this.graphSpace.append('g')
		
	this.utilityBars = this.utilityCharts.selectAll('g')
		.data(this.data)
		.enter().append('g')
			.attr('transform', function(d, i) { 
				return 'translate(' + (_this.configuration.chartWidth / 5) + ',' + ((_this.configuration.objectiveSpacing * i) + (_this.configuration.objectiveSpacing * 5)) + ')'; 
			})
			.style('fill', function(d, i) { return _this.color(i); });


	this.plotStackBarChart();
	this.plotIndividualAlternatives();
}

ValueChart.prototype.plotIndividualAlternatives = function() {
	var _this = this;

	var yMax = d3.max(this.data, function(layer) { return d3.max(layer, function(d) { return d.y; }); });

	var yScale = d3.scale.linear()
    	.domain([0, yMax])
    	.range([0, yMax * 3]);

	this.utilityBars.selectAll('rect')
		.data(function(d) { return d; })
		.enter().append('rect')
			.attr('height', function(d) { return yScale(d.y); })
			.attr('width', this.configuration.barWidth - 1)
			.attr('y', function(d) { return _this.configuration.objectiveSpacing - yScale(d.y); })
			.attr('x', function(d, i) { return (i * _this.configuration.barWidth); });

	this.utilityCharts.selectAll('text')
		.data(this.objectiveLabels)
		.enter().append('text')
			.text(function(d) { return d; })
			.attr('x', this.configuration.textXOffset)
			.attr('y', function(d, i) { return ((i + 1) * _this.configuration.objectiveSpacing) + (_this.configuration.objectiveSpacing * 5);})
			.attr('fill', 'black');

}

ValueChart.prototype.plotStackBarChart = function() {
	var _this = this;

	var stack = d3.layout.stack();
	
	layersData = stack(this.data);

	var yMax = d3.max(layersData, function(layer) { return d3.max(layer, function(d) { return d.y + d.y0; }); });

    var yScale = d3.scale.linear()
    	.domain([0, yMax])
    	.range([yMax * 3, 0]);


    this.stackedBars = this.stackedBarChart.selectAll('g')
		.data(layersData)
		.enter().append('g')
		.style('fill', function(d, i) { return _this.color(i); });

	this.stackedBarChart.selectAll('text')
		.data(this.alternativeLabels)
		.enter().append('text')
			.text(function(d) { return d; })
			.attr('transform', "rotate(-90)")
			.attr('x', this.configuration.textXOffset)
			.attr('y', function(d, i) { return (i * _this.configuration.barWidth) + 15})
			.attr('fill', 'black');

	this.stackedBars.selectAll('rect')
		.data(function(d) {
		 return d; })
		.enter()
		.append('rect')
			.attr('x', function(d) { return d.x * _this.configuration.barWidth; })
    		.attr('y', function(d) { return yScale(d.y0 + d.y); })
    		.attr('width', this.configuration.barWidth - 1)
    		.attr('height', function(d) { return yScale(d.y0) - yScale(d.y0 + d.y);});
}




