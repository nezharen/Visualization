function sugiyama()
{
	subGraph[edgeType] = [];
	var tgraph = [];
	for (var i = 0; i < activityNum; i++)
	{
		subGraph[edgeType].push([]);
		tgraph.push([]);
		for (var j = 0; j < activityNum; j++)
		{
			subGraph[edgeType][i].push(0);
			if (i == j)
				tgraph[i].push(0);
			else
				tgraph[i].push(graph[edgeType][i][j]);
		}
	}
	var v = [];
	for (var i = 0; i < activityNum; i++)
		v.push(true);
	while (true)
	{
		var b;
		for (var i = 0; i < activityNum; i++)
			if (v[i])
			{
				b = true;
				for (var j = 0; j < activityNum; j++)
					if (v[j] && tgraph[i][j] > threshold)
					{
						b = false;
						break;
					}
				if (!b)
				{
					b = true;
					for (var j = 0; j < activityNum; j++)
						if (v[j] && tgraph[j][i] > threshold)
						{
							b = false;
							break;
						}
				}
				if (b)
				{
					for (var j = 0; j < activityNum; j++)
						if (v[j])
						{
							subGraph[edgeType][i][j] = tgraph[i][j];
							subGraph[edgeType][j][i] = tgraph[j][i];
							tgraph[i][j] = 0;
							tgraph[j][i] = 0;
						}
					v[i] = false;
				}
			}

		var minDiff = -1;
		var ti = -1;
		var tInNum, tOutNum;
		for (var i = 0; i < activityNum; i++)
			if (v[i])
			{
				var inNum = 0;
				var outNum = 0;
				for (var j = 0; j < activityNum; j++)
					if (v[j])
					{
						if (tgraph[j][i] > threshold)
							inNum++;
						if (tgraph[i][j] > threshold)
							outNum++;
					}
				if (Math.abs(inNum - outNum) > minDiff)
				{
					minDiff = Math.abs(inNum - outNum);
					tInNum = inNum;
					tOutNum = outNum;
					ti = i;
				}
			}
		if (ti > -1)
		{
			for (var j = 0; j < activityNum; j++)
				if (v[j])
				{
					if (tInNum > tOutNum)
						subGraph[edgeType][j][ti] = tgraph[j][ti];
					else
						subGraph[edgeType][ti][j] = tgraph[ti][j];
					tgraph[j][ti] = 0;
					tgraph[ti][j] = 0;
				}
			v[ti] = false;
		}

		b = true;
		for (var i = 0; i < activityNum; i++)
			if (v[i])
			{
				b = false;
				break;
			}
		if (b)
			break;
	}
}

function topoSort()
{
	topoLayout[edgeType] = [];
	orderNum = [];
	levelNum = 0;
	maxOrder = 1;
	var v = [];
	var inNum = [];
	for (var i = 0; i < activityNum; i++)
	{
		topoLayout[edgeType].push({"level": -1, "order": -1});
		v.push(true);
		inNum.push(0);
		for (var j = 2; j < activityNum; j++)
			if (subGraph[edgeType][j][i] > threshold)
				inNum[i]++;
	}
	orderNum.push(0);
	topoLayout[edgeType][0]["level"] = levelNum;
	topoLayout[edgeType][0]["order"] = orderNum[levelNum];
	orderNum[levelNum]++;
	levelNum++;
	while (true)
	{
		var stack = [];
		orderNum.push(0);
		for (var i = 2; i < activityNum; i++)
			if (v[i] && (inNum[i] == 0))
			{
				topoLayout[edgeType][i]["level"] = levelNum;
				topoLayout[edgeType][i]["order"] = orderNum[levelNum];
				orderNum[levelNum]++;
				if (orderNum[levelNum] > maxOrder)
					maxOrder = orderNum[levelNum];
				stack.push(i);
			}
		if (stack.length == 0)
			break;
		while (stack.length > 0)
		{
			var i = stack.pop();
			v[i] = false;
			for (var j = 2; j < activityNum; j++)
				if (subGraph[edgeType][i][j] > threshold)
					inNum[j]--;
		}
		levelNum++;
	}
	orderNum.push(0);
	topoLayout[edgeType][1]["level"] = levelNum;
	topoLayout[edgeType][1]["order"] = orderNum[levelNum];
	orderNum[levelNum]++;
	levelNum++;
}

function calcTopoLayout()
{
	sugiyama()
	topoSort();
}

function calcLayout()
{
	var goldenRation = 1.618;
	rectWidth = svgWidth / (2 * maxOrder + 1);
	rectHeight = svgHeight / (2 * levelNum + 1);
	if (rectHeight * goldenRation < rectWidth)
		rectWidth = rectHeight * goldenRation;
	else
		rectHeight = rectWidth / goldenRation;
	layout[edgeType] = [];
	minSpaceWidth = 1e9;
	for (var i = 0; i < activityNum; i++)
	{
		var spaceWidth = (svgWidth - rectWidth * orderNum[topoLayout[edgeType][i]["level"]]) / (orderNum[topoLayout[edgeType][i]["level"]] + 1);
		var spaceHeight = (svgHeight - rectHeight * levelNum) / (levelNum + 1);
		var x = spaceWidth * (topoLayout[edgeType][i]["order"] + 1) + rectWidth * topoLayout[edgeType][i]["order"];
		var y = spaceHeight * (topoLayout[edgeType][i]["level"] + 1) + rectHeight * topoLayout[edgeType][i]["level"];
		var dx = spaceWidth * (1 - 1 / goldenRation) / 2 + Math.random() / 2 * spaceWidth;
		if (spaceWidth < minSpaceWidth)
			minSpaceWidth = spaceWidth;
		if ((topoLayout[edgeType][i]["level"] & 1) == 0)
			x -= dx;
		else
			x += dx;
		layout[edgeType].push({"x": x, "y": y});
	}
	calcPathLayout();
}

function calcPathLayout()
{
	pathLayout[edgeType] = [];
	for (var i = 0; i < activityNum; i++)
	{
		pathLayout[edgeType].push([]);
		for (var j = 0; j < activityNum; j++)
		{
			pathLayout[edgeType][i].push([]);
			if (graph[edgeType][i][j] > threshold)
				if (i == j)
				{
					var t = Math.min(rectWidth / 2, minSpaceWidth / 2);
					pathLayout[edgeType][i][i].push({"x": layout[edgeType][i].x, "y": layout[edgeType][i].y});
					pathLayout[edgeType][i][i].push({"x": layout[edgeType][i].x, "y": layout[edgeType][i].y - t});
					pathLayout[edgeType][i][i].push({"x": layout[edgeType][i].x - t, "y": layout[edgeType][i].y - t});
					pathLayout[edgeType][i][i].push({"x": layout[edgeType][i].x - t, "y": layout[edgeType][i].y});
					pathLayout[edgeType][i][i].push({"x": layout[edgeType][i].x, "y": layout[edgeType][i].y});
				}
				else
				{
					var dx = layout[edgeType][j].x - layout[edgeType][i].x;
					var dy = layout[edgeType][j].y - layout[edgeType][i].y;
					var sin = dy / Math.sqrt(dx * dx + dy * dy);
					var cos = dx / Math.sqrt(dx * dx + dy * dy);
					var t = Math.sqrt(2) / 2;
					var start = {"x": layout[edgeType][i].x, "y": layout[edgeType][i].y};
					var end = {"x": layout[edgeType][j].x, "y": layout[edgeType][j].y};
					if (sin >= t)
					{
						start.x += rectWidth / 2;
						start.y += rectHeight;
						end.x += rectWidth / 2;
					}
					else
						if (sin <= -t)
						{
							start.x += rectWidth / 2;
							end.x += rectWidth / 2;
							end.y += rectHeight;
						}
						else
							if (cos >= t)
							{
								start.x += rectWidth;
								start.y += rectHeight / 2;
								end.y += rectHeight / 2;
							}
							else
							{
								start.y += rectHeight / 2;
								end.x += rectWidth;
								end.y += rectHeight / 2;
							}
					pathLayout[edgeType][i][j].push(start);
					var controlNum = 3;//must be odd
					dx = (end.x - start.x) / (controlNum + 1);
					dy = (end.y - start.y) / (controlNum + 1);
					t = Math.sqrt(3) / 2;
					for (var k = 1; k <= controlNum; k++)
					{
						var tx = start.x + dx * k;
						var ty = start.y + dy * k;
						var dtx = 0;
						var dty = 0;
						for (var p = 0; p < activityNum; p++)
							if (p != i && p != j)
							{
								var ddtx = tx - (layout[edgeType][p].x + rectWidth / 2);
								var ddty = ty - (layout[edgeType][p].y + rectHeight / 2);
								if (Math.abs((ddtx * dx + ddty * dy) / Math.sqrt(ddtx * ddtx + ddty * ddty) / Math.sqrt(dx * dx + dy * dy)) > t)
								{
									var swaper = ddtx;
									ddtx = ddty;
									ddty = swaper;
								}
								var dis = Math.sqrt(ddtx * ddtx + ddty * ddty);
								ddtx *= 100000 / (dis * dis * dis);
								ddty *= 100000 /(dis * dis * dis);
								if (Math.abs(ddtx) > Math.min(minSpaceWidth, svgWidth / 10))
									ddtx = ddtx / Math.abs(ddtx) * Math.min(minSpaceWidth, svgWidth / 10);
								if (Math.abs(ddty) > Math.min(minSpaceWidth, svgHeight / 10))
									ddty = ddty / Math.abs(ddty) * Math.min(minSpaceWidth, svgHeight / 10);
								dtx += ddtx;
								dty += ddty;
							}
						tx += dtx;
						ty += dty;
						pathLayout[edgeType][i][j].push({"x": tx, "y": ty});
					}
					pathLayout[edgeType][i][j].push(end);
				}
		}
	}
}

function resetProperty()
{
	if (activitySelected > -1)
		return;
	if (graph[edgeType][pathSelected.x][pathSelected.y] <= threshold)
	{
		activitySelected = 0;
		pathSelected = {"x": -1, "y": -1};
		showProperty();
	}
}

function showProperty()
{
	if (activitySelected > -1)
	{
		$("#property-name-1").text("Activity Index");
		$("#property-value-1").val(activitySelected);
		$("#property-name-2").text("Activity Name");
		$("#property-value-2").val(graph["activity_name"][activitySelected]);
		return;
	}
	$("#property-name-1").text("Edge Index");
	$("#property-value-1").val("[" + pathSelected.x + "," +  pathSelected.y + "]");
	$("#property-name-2").text("Edge Weight");
	$("#property-value-2").val(graph[edgeType][pathSelected.x][pathSelected.y]);
}

function paint()
{
	var activityDrag = d3.behavior.drag()
			.on("dragstart", function(d, i) {
				d3.event.sourceEvent.stopPropagation();
				d3.select(this).classed("dragging", true);
				activitySelected = i;
				pathSelected = {"x": -1, "y": -1};
				showProperty();
			})
			.on("drag", function(d, i) {
				var t = Math.min(rectWidth / 2, minSpaceWidth / 2);
				var tx = layout[edgeType][i].x + d3.event.dx;
				var ty = layout[edgeType][i].y + d3.event.dy;
				if (graph[edgeType][i][i] > threshold)
				{
					if ((tx - t) < 0 || (ty - t) < 0 || (tx + rectWidth > svgWidth) || (ty + rectHeight > svgHeight))
						return;
				}
				else
				{
					if (tx < 0 || ty < 0 || (tx + rectWidth > svgWidth) || (ty + rectHeight > svgHeight))
						return;
				}
				layout[edgeType][i].x = tx;
				layout[edgeType][i].y = ty;;
				calcPathLayout();
				repaint();
			})
			.on("dragend", function() {
				d3.select(this).classed("dragging", false);
			});
	var pathDrag = d3.behavior.drag()
			.on("dragstart", function(d) {
				d3.event.sourceEvent.stopPropagation();
				activitySelected = -1;
				pathSelected = {"x": d.x, "y":d.y};
				showProperty();
			});
	activityContainers = svgContainer.selectAll("g")
		.data(layout[edgeType])
		.enter()
		.append("g")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(activityDrag);
	activityRects = activityContainers.append("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.attr("stroke", "black")
		.attr("stroke-width", 2)
		.attr("rx", 5)
		.attr("fill", "#4d97d6");
	activityTexts = activityContainers.append("text")
		.attr("x", 10)
		.attr("y", rectHeight / 2)
		.attr("fill", "white")
		.attr("font-weight", "bold")
		.text(function(d, i) { return i; });
		//.text(function(d, i) { return graph["activity_name"][i]; });
	var lineFunction = function(d) {
		// var s = "";
		// for (var i = 0; i < d.length; i += 2)
		// 	if (i == 0)
		// 		s += "M " + d[i].x + " " + d[i].y;
		// 	else
		// 		s += " Q " + d[i - 1].x + " " + d[i - 1].y + " " + d[i].x + " " + d[i].y;
		// return s;
		if(d.length == 5)
			//return ("M" + d[0].x + "," + d[0].y + " C" + d[2].x + "," + d[2].y + " " + d[4].x + " ," + d[4].y);
			return ("M " + d[0].x + " " + d[0].y + " L " + d[4].x + " " + d[4].y  );
		else 
			return "";
	};
	edgePaths = [];
	for (var i = 0; i < activityNum; i++)
	{
		edgePaths.push([]);
		for (var j = 0; j < activityNum; j++)
		{
			edgePaths[i].push([]);
			edgePaths[i][j] = svgContainer.append("path")
				.data([{"x": i, "y": j}])
				.attr("d", lineFunction(pathLayout[edgeType][i][j]))
				.attr("stroke", "black")
				.attr("stroke-width", 2)
				.attr("fill", "none")
				.attr("marker-end","url(#arrow)")
				.call(pathDrag);
		}
	}
}
/*
function getCircleX(d){
	from = d.from;
	to = d.to;
	begin = d.begin;
	end = d.end;
	x1 = pathLayout[edgeType][from][to][0].x;
	x2 = pathLayout[edgeType][from][to][4].x;
	rate = (frame - begin) / (end - begin);
	return rate * (x2 - x1) + x1;
}
function getCircleY(d){
	from = d.from;
	to = d.to;
	begin = d.begin;
	end = d.end;
	y1 = pathLayout[edgeType][from][to][0].y;
	y2 = pathLayout[edgeType][from][to][4].y;
	rate = (frame - begin) / (end - begin);
	return rate * (y2 - y1) + y1;
}*/

function repaint()
{
	activityContainers
		.data(layout[edgeType])
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	activityRects
		.data(activity_count)
		.attr("fill", function(d){ return activityColorScale(d);})
		.attr("width", rectWidth)
		.attr("height", rectHeight);
	activityTexts
		.attr("y", rectHeight / 2);
	var lineFunction = function(d) {
		var s = "";
		// for (var i = 0; i < d.length; i += 2)
		// 	if (i == 0)
		// 		s += "M " + d[i].x + " " + d[i].y;
		// 	else
		// 		s += " Q " + d[i - 1].x + " " + d[i - 1].y + " " + d[i].x + " " + d[i].y;
		// return s;
		if(d.length == 5)
			//return ("M" + d[0].x + "," + d[0].y + " C" + d[2].x + "," + d[2].y + " " + d[4].x + " ," + d[4].y);
			return ("M " + d[0].x + " " + d[0].y + " L " + d[4].x + " " + d[4].y  );
		else 
			return "";
	};
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			edgePaths[i][j]
				.attr("d", lineFunction(pathLayout[edgeType][i][j]))
				.attr("stroke", edgeColorScale(edge_count[i][j]))
				.attr("stroke-width", edgeWidthScale(edge_count[i][j]))

	/*for (var i = 0; i < livingCase.length; i++){
		if(livingCase[i].from == undefined)
			continue;
		if(pathLayout[edgeType][livingCase[i].from][livingCase[i].to].length == 0)	//该边不存在
			continue;
		caseCircle[i]
	        .attr("stroke","yellow")
	        .attr("fill","red")
	        .attr("cx", getCircleX(livingCase[i].from,livingCase[i].to,livingCase[i].begin,livingCase[i].end))
	        .attr("cy", getCircleY(livingCase[i].from,livingCase[i].to,livingCase[i].begin,livingCase[i].end))
	        .attr("r", 4);
	}*/

	d3.select("body").selectAll("circle")
		.data(livingCase)
		.enter()
		.append("circle")
			.attr("class","circle")
			.attr("stroke","yellow")
		    .attr("fill","red")
		    .attr("cx", function(d){
		    	if(d.from == undefined)
					return 100;
				if(pathLayout[edgeType][d.from][d.to].length == 0)	//该边不存在
					return 100;
		    	var from = d.from;
				var to = d.to;
				var begin = d.begin;
				var end = d.end;
				x1 = pathLayout[edgeType][from][to][0].x;
				x2 = pathLayout[edgeType][from][to][4].x;
				rate = (frame - begin) / (end - begin);
				return rate * (x2 - x1) + x1;
		    })
		    .attr("cy", function(d){
		    	if(d.from == undefined)
					return 100;
				// console.log("xxx");
				if(pathLayout[edgeType][d.from][d.to].length == 0)	//该边不存在
					return 100;
				console.log("yyy");
		    	var from = d.from;
				var to = d.to;
				var begin = d.begin;
				var end = d.end;
				y1 = pathLayout[edgeType][from][to][0].y;
				y2 = pathLayout[edgeType][from][to][4].y;
				rate = (frame - begin) / (end - begin);
				return rate * (y2 - y1) + y1;
		    })
	    	.attr("r",4);
	d3.select("body").selectAll("circle")
		.data(livingCase)
		.exit()
			.remove();
}



function resize()
{
	$("#main").height($(window).height() - 20);
	$("#aside").height($(window).height() - 20);
	var originSvgWidth = svgWidth;
	var originSvgHeight = svgHeight;
	svgWidth = $("#svg").width();
	svgHeight = $("#svg").height();
	rectWidth *= (svgWidth / originSvgWidth);
	rectHeight *= (svgHeight / originSvgHeight);
	for (var i = 0; i < activityNum; i++)
	{
		layout[edgeType][i].x *= (svgWidth / originSvgWidth);
		layout[edgeType][i].y *= (svgHeight / originSvgHeight);
	}
	fixChartHeight();
}

function setEdgeType()
{
	edgeType = $("#edgetype").val() + "_edge";
	if (edgeWeights[edgeType] != undefined)
		return;
	edgeWeights[edgeType] = [];
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			edgeWeights[edgeType].push(graph[edgeType][i][j]);
	for (var i = 1; i < activityNum * activityNum; i++)
		for (var j = 0; j < activityNum * activityNum - i; j++)
			if (edgeWeights[edgeType][j] < edgeWeights[edgeType][j + 1])
			{
				var t = edgeWeights[edgeType][j];
				edgeWeights[edgeType][j] = edgeWeights[edgeType][j + 1];
				edgeWeights[edgeType][j + 1] = t;
			}
}

function setThreshold()
{
	threshold = (activityNum * activityNum - 1) * $("#threshold").val() / 100;
	threshold = edgeWeights[edgeType][parseInt(threshold, 10)];
	$("#threshold-value").text($("#threshold").val() + "%");
}

function setChart()
{
	var options = {
		chart: {
			renderTo: "chart",
			type: "pie"
		},
		tooltip: {
			pointFormat: "{series.name}: <b>{point.y}</b>"
		},
		title: {
			text: null
		},
		series: [{
			name: $("#edgetype").val(),
			data: []
		}]
	};
	for (var i = 0; i < activityNum; i++)
	{
		options["series"][0]["data"].push({"name": i, "y": graph[$("#edgetype").val()][i]});
	}
	chart = Highcharts.chart(options);
}

function fixChartHeight()
{
	var t = $("#edgetype-form").height() + $("#threshold-form").height() + $("#chart").height() + $("#table").height() + 50;
	$("#chart").height($("#chart").height() - (t - $("#aside").height()));
}

function init()
{
	$("#loading").modal("toggle");
	d3.json("data/graphNet.json", function (error, data) {
			var zoom = d3.behavior.zoom()
				.scaleExtent([0.1, 10])
				.on("zoom", function() {
					svgContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				});
			d3.select("#svg").call(zoom);
			svgContainer = d3.select("#svg").append("g");
			svgContainer.append("defs").append("marker")
				.attr("id","arrow")
				.attr("markerUnits","strokeWidth")
				.attr("markerWidth","12")
				.attr("markerHeight","12")
				.attr("viewBox","0 0 12 12") 
				.attr("refX","6")
				.attr("refY","6")
				.attr("orient","auto")
				.append("path")
				.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
				.attr("fill", "black");
			graph = data;
			activityNum = graph["activity_name"].length;
			edgeWeights = {};
			subGraph = {};
			topoLayout = {};
			layout = {};
			pathLayout = {};
			$("#main").height($(window).height() - 20);
			$("#aside").height($(window).height() - 20);
			svgWidth = $("#svg").width();
			svgHeight = $("#svg").height();
			setEdgeType();
			setThreshold();
			calcTopoLayout();
			calcLayout();
			paint();
			setChart();
			activitySelected = 0;
			pathSelected = {"x": -1, "y": -1};
			showProperty();
			fixChartHeight();
			$(window).resize(function() {
				resize();
				calcPathLayout();
				repaint();
			});
			$("#edgetype").change(function() {
				setEdgeType();
				setThreshold();
				calcTopoLayout();
				calcLayout();
				repaint();
				setChart();
				resetProperty();
				});
			$("#threshold").change(function() {
				setThreshold();
				calcTopoLayout();
				calcLayout();
				repaint();
				resetProperty();
			});
			$("#resize").click(function() {
				svgContainer.attr("transform", "");
				zoom.translate([0, 0]);
				zoom.scale(1);
			});
			$("#property-value-2").bind("keypress", function (e) {
				if (e.keyCode == "13")
				{
					if (activitySelected > -1)
					{
						graph["activity_name"][activitySelected] = $("#property-value-2").val();
					}
					else
					{
						graph[edgeType][pathSelected.x][pathSelected.y] = parseInt($("#property-value-2").val(), 10);
						calcTopoLayout();
						calcLayout();
						repaint();
						resetProperty();
					}
				}
			});
			$("#loading").modal("toggle");
	});



	d3.json("backend/animation.json", function (error, data) {
		animationJson = data;

		time = 0;		//当前时刻
		period = 30;	//刷新率
		minTime = 5000;									// 播放最短时长
		maxTime = 50000;//animationJson.end - animationJson.begin;	// 播放最长时长为原数据总时长
		playTime = maxTime - (maxTime-minTime) / 100 * ($("#playSpeed").val());	//播放总时长 10s -100s

		frame = animationJson.begin;	//当前帧数

		activity_count = [];			//维护activity的数量
		edge_count = [];				//维护edge的数量
		for(i = 0; i < activityNum; i++){
			activity_count[i] = 0;
			edge_count.push([]);
			for(j =0; j < activityNum; j++){
				edge_count[i][j] = 0;
			}
		}

		livingCase = [];				//维护需要显示的case数组
		frameListIndex = 0;				//frameList的当前索引

		activityColorScale = d3.scale.linear()
	        .domain([0, 50])
	        .range(["#add8e6", "blue"]);
	    edgeColorScale = d3.scale.linear()
	        .domain([0, 50])
	        .range(["#f2cbbc", "red"]);
	    edgeWidthScale = d3.scale.linear()
	        .domain([0, 50])
	        .range([1, 2]);

		$("#position").val(0);
	});
}

function frameToTime(frame){
	return parseInt((frame - animationJson.begin) / (animationJson.end - animationJson.begin) * playTime);
}
function timeToFrame(time){
	return parseInt(time / playTime * (animationJson.end - animationJson.begin) + animationJson.begin);
}

function testRepeatTime(){
	for(var i = 0; i < animationJson.frame_list.length; i++){
	   	for(var j = 0; j < animationJson.frame_list[i].activity_case.length; j++){
	       	if(animationJson.frame_list[i].activity_case[j].begin == animationJson.frame_list[i].activity_case[j].end)
	            console.log("activity + " + animationJson.frame_list[i].activity_case[j].case_id + "  +  " + animationJson.frame_list[i].frame);}
	   	for(var j = 0; j < animationJson.frame_list[i].edge_case.length; j++){
	       	if(animationJson.frame_list[i].edge_case[j].begin == animationJson.frame_list[i].edge_case[j].end)
	            console.log("edge + " + animationJson.frame_list[i].edge_case[j].case_id + "  +  " + animationJson.frame_list[i].frame);}
	}
}

// 维护livingCase数组
function updateCase(){
	var tmpFrameList = animationJson.frame_list[frameListIndex];	// 关键当前帧的所有内容
	var tmpFrame = tmpFrameList.frame;				// 关键当前帧下的帧数

	var toBeDeletedCase = [];
	//读取activity信息
	for(var i = 0; i < tmpFrameList.activity_case.length; i++){	
	// tmpFrameList.activity_case[i].begin != tmpFrameList.activity_case[i].end 
		if(tmpFrameList.activity_case[i].begin == tmpFrame){
			// 删去原本edge的case
			for(var j = 0; j < livingCase.length; j++){
				if(livingCase[j].case_id == tmpFrameList.activity_case[i].case_id){
					if(livingCase[j].from == undefined){
						toBeDeletedCase.push(livingCase[j].case_id);
						break;
					}
					edge_count[livingCase[j].from][livingCase[j].to]--;
					livingCase.splice(j,1);	//删除第j个元素往后1个
					break;
				}
			}
			// 开始帧数等于当前帧，case加入
			livingCase.push(tmpFrameList.activity_case[i]);
			activity_count[tmpFrameList.activity_case[i].index]++;
		}
	}
	//读取edge信息(开始结束的frame必定在edge中)
	for(var i = 0; i < tmpFrameList.edge_case.length; i++){

		if(tmpFrameList.edge_case[i].begin == -1){	// 整个case结束
			for(j = 0; j < livingCase.length; j++){
				if(livingCase[j].case_id == tmpFrameList.edge_case[i].case_id){
					edge_count[tmpFrameList.edge_case[i].from][tmpFrameList.edge_case[i].to]--;
					livingCase.splice(j,1);	//删除第j个元素往后1个
					break;
				}
			}
		}
		//tmpFrameList.edge_case[i].begin != tmpFrameList.edge_case[i].end
		else if(tmpFrameList.edge_case[i].begin == tmpFrame){	// case第一次出现 或者 从activity到edge
			// 删去原本activity的case
			for(var j = 0; j < livingCase.length; j++){
				if(livingCase[j].case_id == tmpFrameList.edge_case[i].case_id){
					if(livingCase[j].index == undefined){
						toBeDeletedCase.push(livingCase[j].case_id);
						break;
					}
					activity_count[livingCase[j].index]--;
					livingCase.splice(j,1);	//删除第j个元素往后1个
					break;
				}
			}
			// 新增edge的case
			livingCase.push(tmpFrameList.edge_case[i]);
			edge_count[tmpFrameList.edge_case[i].from][tmpFrameList.edge_case[i].to]++;
		}
	}
	// 最后删掉因为时间冲突之前未删除的
	for(var i = 0; i < toBeDeletedCase.length; i++){
		for(var j = livingCase.length - 1; j > 0; j--){
			if(livingCase[j].case_id == toBeDeletedCase[i]){
				if(livingCase[j].index != undefined){
					activity_count[livingCase[j].index]--;
				}
				else if(livingCase[j].from != undefined){
					edge_count[livingCase[j].from][livingCase[j].to]--;
				}
				livingCase.splice(j,1);
			}
		}
	}
}

$(document).ready(init);

function update(){


	if(time >= playTime){
		$("#play span").attr("class", "glyphicon glyphicon-play");
		time = 0;
		frameListIndex = 0;
	    clearInterval(updateInterval);
	    console.log("clear");
	}
	frame = timeToFrame(time);

	while(frame >= animationJson.frame_list[frameListIndex].frame){
		updateCase();
		if(frameListIndex < animationJson.frame_list.length - 1)
			frameListIndex++;
		else
			break;
	}
	repaint();
	$("#position").val(time / playTime * 100);
	// console.log(time,$("#position").val());
	time += period;
}

function setPosition()
{
	var dragFrameList = animationJson.drag_frame_list[$("#position")[0].value];
	frame = dragFrameList.frame;
	time = frameToTime(frame);

	livingCase = [];
	activity_count = [];			//维护activity的数量
	edge_count = [];				//维护edge的数量
	for(var i = 0; i < activityNum; i++){
		activity_count[i] = 0;
		edge_count.push([]);
		for(var j =0; j < activityNum; j++){
			edge_count[i][j] = 0;
		}
	}

	// 最好处理数据能给出当前帧对应frame_list的位置，避免遍历
	frameListIndex = 0;				//维护frameListIndex
	while(frame >= animationJson.frame_list[frameListIndex].frame){
		if(frameListIndex < animationJson.frame_list.length - 1)
			frameListIndex++;
		else
			break;
	}

	for(var i = 0; i < dragFrameList.activity_case.length; i++){
		livingCase.push(dragFrameList.activity_case[i]);
		activity_count[dragFrameList.activity_case[i].index]++
	}
	for(var i = 0; i < dragFrameList.edge_case.length; i++){
		livingCase.push(dragFrameList.edge_case[i]);
		edge_count[dragFrameList.edge_case[i].from][dragFrameList.edge_case[i].to]++
	}
}

$("#position").change(function() {
	setPosition();
	repaint();
});

$("#play").click(function() {
	if($("#play span").attr("class") == "glyphicon glyphicon-play"){
		$("#play span").attr("class", "glyphicon glyphicon-pause");
		setPosition();	//通过进度条判断，不存储time等变量
		updateInterval = setInterval(update,period);
	}
	else if($("#play span").attr("class") == "glyphicon glyphicon-pause"){
		$("#play span").attr("class", "glyphicon glyphicon-play");
		clearInterval(updateInterval);
	}
});

$("#playSpeed").change(function() {
	playTime = maxTime - (maxTime-minTime) / 100 * ($("#playSpeed").val());
	time = timeToFrame(frame);
	setPosition();	//该函数有保存作用
	repaint();
});