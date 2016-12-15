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
	topoLayout = [];
	orderNum = [];
	levelNum = 0;
	maxOrder = 1;
	var v = [];
	var inNum = [];
	for (var i = 0; i < activityNum; i++)
	{
		topoLayout.push({"level": -1, "order": -1});
		v.push(true);
		inNum.push(0);
		for (var j = 2; j < activityNum; j++)
			if (subGraph[edgeType][j][i] > threshold)
				inNum[i]++;
	}
	orderNum.push(0);
	topoLayout[0]["level"] = levelNum;
	topoLayout[0]["order"] = orderNum[levelNum];
	orderNum[levelNum]++;
	levelNum++;
	while (true)
	{
		var stack = [];
		orderNum.push(0);
		for (var i = 2; i < activityNum; i++)
			if (v[i] && (inNum[i] == 0))
			{
				topoLayout[i]["level"] = levelNum;
				topoLayout[i]["order"] = orderNum[levelNum];
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
	topoLayout[1]["level"] = levelNum;
	topoLayout[1]["order"] = orderNum[levelNum];
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
	layout = [];
	for (var i = 0; i < activityNum; i++)
	{
		var spaceWidth = (svgWidth - rectWidth * orderNum[topoLayout[i]["level"]]) / (orderNum[topoLayout[i]["level"]] + 1);
		var spaceHeight = (svgHeight - rectHeight * levelNum) / (levelNum + 1);
		var x = spaceWidth * (topoLayout[i]["order"] + 1) + rectWidth * topoLayout[i]["order"];
		var y = spaceHeight * (topoLayout[i]["level"] + 1) + rectHeight * topoLayout[i]["level"];
		var dx = spaceWidth * (1 - 1 / goldenRation) / 2;
		if (rectWidth * goldenRation / 2 < dx)
			dx = rectWidth * goldenRation / 2;
		if ((topoLayout[i]["level"] & 1) == 0)
			x -= dx;
		else
			x += dx;
		layout.push({"x": x, "y": y});
	}
}

function paint()
{
	calcLayout();
	var activityContainers = svg.selectAll("g")
		.data(layout)
		.enter()
		.append("g")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	activityContainers.append("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.attr("stroke", "black")
		.attr("stroke-width", 2)
		.attr("rx", 5)
		.attr("fill", "#4d97d6");
	activityContainers.append("text")
		.attr("x", 10)
		.attr("y", rectHeight / 2)
		.attr("fill", "white")
		.attr("font-weight", "bold")
		.text(function(d, i) { return i; });
		//.text(function(d, i) { return graph["activity_name"][i]; });
}

function repaint()
{
	calcLayout();
	svg.selectAll("g")
		.data(layout)
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	svg.selectAll("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
	svg.selectAll("text")
		.attr("y", rectHeight / 2)
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
	$.ready();
	resize();
	d3.json("data/graphNet.json", function (error, data) {
			svg = d3.select("#svg")
			graph = data;
			activityNum = graph["activity_name"].length;
			subGraph = {};
			setEdgeType();
			setThreshold();
			calcTopoLayout();
			paint();
			$(window).resize(function() {
				resize();
				repaint();
			});
			$("#threshold").change(function() {
				setThreshold();
				calcTopoLayout();
				repaint();
			});
	});

}

$(document).ready(init);
