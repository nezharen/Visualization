function sugiyama(lazy)
{
	if (lazy && (subGraph[edgeType] != undefined))
		return;
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

function topoSort(lazy)
{
	if (lazy && (topoLayout[edgeType] != undefined))
		return;
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

function calcTopoLayout(lazy)
{
	sugiyama(lazy)
	topoSort(lazy);
}

function calcLayout(lazy)
{
	if (lazy && (layout[edgeType] != undefined) && (pathLayout[edgeType] != undefined))
		return;
	var goldenRation = 1.618;
	rectWidth = svgWidth / (2 * maxOrder + 1);
	rectHeight = svgHeight / (2 * levelNum + 1);
	if (rectHeight * goldenRation < rectWidth)
		rectWidth = rectHeight * goldenRation;
	else
		rectHeight = rectWidth / goldenRation;
	layout[edgeType] = [];
	for (var i = 0; i < activityNum; i++)
	{
		var spaceWidth = (svgWidth - rectWidth * orderNum[topoLayout[edgeType][i]["level"]]) / (orderNum[topoLayout[edgeType][i]["level"]] + 1);
		var spaceHeight = (svgHeight - rectHeight * levelNum) / (levelNum + 1);
		var x = spaceWidth * (topoLayout[edgeType][i]["order"] + 1) + rectWidth * topoLayout[edgeType][i]["order"];
		var y = spaceHeight * (topoLayout[edgeType][i]["level"] + 1) + rectHeight * topoLayout[edgeType][i]["level"];
		var dx = spaceWidth * (1 - 1 / goldenRation) / 2;
		if (rectWidth * goldenRation / 2 < dx)
			dx = rectWidth * goldenRation / 2;
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
			if ((i != j) && (graph[edgeType][i][j] > threshold))
				if (topoLayout[edgeType][i]["level"] < topoLayout[edgeType][j]["level"])
				{
					pathLayout[edgeType][i][j].push({"x": layout[edgeType][i].x + rectWidth / 2, "y": layout[edgeType][i].y + rectHeight});
					pathLayout[edgeType][i][j].push({"x": layout[edgeType][j].x + rectWidth / 2, "y": layout[edgeType][j].y});
				}
				else
					if (topoLayout[edgeType][i]["level"] > topoLayout[edgeType][j]["level"])
					{
						pathLayout[edgeType][i][j].push({"x": layout[edgeType][i].x + rectWidth / 2, "y": layout[edgeType][i].y});
						pathLayout[edgeType][i][j].push({"x": layout[edgeType][j].x + rectWidth / 2, "y": layout[edgeType][j].y + rectHeight});
					}
					else
						if (topoLayout[edgeType][i]["order"] < topoLayout[edgeType][j]["order"])
						{
							pathLayout[edgeType][i][j].push({"x": layout[edgeType][i].x + rectWidth, "y": layout[edgeType][i].y + rectHeight / 2});
							pathLayout[edgeType][i][j].push({"x": layout[edgeType][j].x, "y": layout[edgeType][j].y + rectHeight / 2});
						}
						else
						{
							pathLayout[edgeType][i][j].push({"x": layout[edgeType][i].x, "y": layout[edgeType][i].y + rectHeight / 2});
							pathLayout[edgeType][i][j].push({"x": layout[edgeType][j].x + rectWidth, "y": layout[edgeType][j].y + rectHeight / 2});
						}
		}
	}
}

function paint()
{
	var drag = d3.behavior.drag().on("drag", function(d, i) {
		layout[edgeType][i].x += d3.event.dx;
		layout[edgeType][i].y += d3.event.dy;
		calcPathLayout();
		repaint();
	});
	activityContainers = svg.selectAll("g")
		.data(layout[edgeType])
		.enter()
		.append("g")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(drag);
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
	var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("basis");
	edgePaths = [];
	for (var i = 0; i < activityNum; i++)
	{
		edgePaths.push([]);
		for (var j = 0; j < activityNum; j++)
		{
			edgePaths[i].push([]);
			edgePaths[i][j] = svg.append("path")
				.attr("d", lineFunction(pathLayout[edgeType][i][j]))
				.attr("stroke", "black")
				.attr("stroke-width", 2)
				.attr("fill", "none")
				.attr("marker-end","url(#arrow)");
		}
	}
}

function repaint()
{
	activityContainers
		.data(layout[edgeType])
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	activityRects
		.attr("width", rectWidth)
		.attr("height", rectHeight);
	activityTexts
		.attr("y", rectHeight / 2);
	var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("linear");
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			edgePaths[i][j]
				.attr("d", lineFunction(pathLayout[edgeType][i][j]))
}

function resize()
{
	$("#main").height($(window).height());
	$("#aside").height($(window).height());
	svgWidth = $("#svg").width();
	svgHeight = $("#svg").height();
}

function setEdgeType()
{
	edgeType = "case_frequency_edge";
}

function setThreshold()
{
	threshold = 0;
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			if (graph[edgeType][i][j] > threshold)
				threshold = graph[edgeType][i][j];
	threshold = threshold * $("#threshold")[0].value / 100;
}

function init()
{
	d3.json("data/graphNet.json", function (error, data) {
			svg = d3.select("#svg");
			svg.append("defs").append("marker")
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
			subGraph = {};
			topoLayout = {};
			layout = {};
			pathLayout = {};
			setEdgeType();
			setThreshold();
			calcTopoLayout(true);
			resize();
			calcLayout();
			paint();
			$(window).resize(function() {
				resize();
				calcLayout();
				repaint();
			});
			$("#threshold").change(function() {
				setThreshold();
				calcTopoLayout(false);
				calcLayout();
				repaint();
			});
	});

}

$(document).ready(init);
