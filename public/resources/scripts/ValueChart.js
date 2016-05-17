/*
* @Author: aaronmishkin
* @Date:   2016-05-05 14:14:04
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2016-05-16 21:43:21
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

	this.topWeightScale = d3.scale.linear()
	    	.domain([-75, 75])
	    	.range([0, 1/3]);

	this.bottomWeightScale = d3.scale.linear()
    	.domain([-75, 75])
    	.range([1/3, 0]);

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

				var initWeight = 1 / 6;

				return {x: rowIndex, y: +row[colIndex], lineY: 0, weight: initWeight}; 
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
		.attr('transform', 'translate(' + (this.configuration.chartWidth / 5) + ', 280)');

	this.utilityCharts = this.graphSpace.append('g')
		
	this.utilityBars = this.utilityCharts.selectAll('g')
		.data(this.data)
		.enter().append('g')
			.attr('transform', function(d, i) { 
				return 'translate(' + (_this.configuration.chartWidth / 5) + ',' + ((_this.configuration.objectiveSpacing * i) + (_this.configuration.objectiveSpacing * 5)) + ')'; 
			})
			.style('fill', function(d, i) { return _this.color(i); });

	var resizeLines = this.utilityBars.append('g')
		.attr('transform', 'translate(0,80)')
		.append('line')
			.attr('x1', -5)
			.attr('y1', function(d) { return d.lineY; })
			.attr('x2', 200)
			.attr('y2', function(d) { return d.lineY; })
			.style('stroke', 'red')
			.style('stroke-width', 6);

	resizeLines.call(d3.behavior.drag().on('drag', function(d, i) {
		console.log(d, i);

		console.log(d3.event.x, d3.event.y);


    	_this.data[i+1].forEach(function(element) { 
			element.weight= _this.bottomWeightScale(d3.event.y); 
		});

		d.forEach(function(element) { 
			element.weight =  _this.topWeightScale(d3.event.y); 
			element.lineY = d3.event.y;
		});

		_this.utilityBars.data(_this.data)
			.selectAll('.utilityGraphs')
				.selectAll('rect')
					.attr('height', function(d) { return _this.yScale(d.y * d.weight); })
					.attr('y', function(d) { return (_this.configuration.objectiveSpacing + d.lineY) - _this.yScale(d.y * d.weight); })

		resizeLines
			.attr('y1', function(d) { return d[0].lineY; })
			.attr('y2', function(d) { return d[0].lineY; });

	}))

	this.plotStackBarChart();
	this.plotIndividualAlternatives();
}

ValueChart.prototype.plotIndividualAlternatives = function() {
	var _this = this;

	var yMax = d3.max(this.data, function(layer) { return d3.max(layer, function(d) { return d.y; }); });

	this.yScale = d3.scale.linear()
    	.domain([0, 1])
    	.range([0, 75 * 6]);

	this.utilityBars.append('g')
		.attr('class', 'utilityGraphs')
		.selectAll('rect')
		.data(function(d) { return d; })
		.enter().append('rect')
			.attr('height', function(d) { return _this.yScale(d.y * d.weight); })
			.attr('width', this.configuration.barWidth - 1)
			.attr('y', function(d) { return _this.configuration.objectiveSpacing - _this.yScale(d.y * d.weight); })
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
    	.domain([0, 1])
    	.range([75, 0]);


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




