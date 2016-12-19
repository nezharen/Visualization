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
		//if (rectWidth * goldenRation / 2 < dx)
			//dx = rectWidth * goldenRation / 2;
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
								if (Math.abs(ddty) > Math.min(minSpaceWidth, svgWidth / 10))
									ddty = ddty / Math.abs(ddty) * Math.min(minSpaceWidth, svgWidth / 10);
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

function paint()
{
	var drag = d3.behavior.drag().on("drag", function(d, i) {
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
	var lineFunction = function(d) {
		var s = "";
		for (var i = 0; i < d.length; i += 2)
			if (i == 0)
				s += "M " + d[i].x + " " + d[i].y;
			else
				s += " Q " + d[i - 1].x + " " + d[i - 1].y + " " + d[i].x + " " + d[i].y;
		return s;
	};
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
	var lineFunction = function(d) {
		var s = "";
		for (var i = 0; i < d.length; i += 2)
			if (i == 0)
				s += "M " + d[i].x + " " + d[i].y;
			else
				s += " Q " + d[i - 1].x + " " + d[i - 1].y + " " + d[i].x + " " + d[i].y;
		return s;
	};
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			edgePaths[i][j]
				.attr("d", lineFunction(pathLayout[edgeType][i][j]))
}

function resize()
{
	$("#main").height($(window).height() - 20);
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
}

function setEdgeType()
{
	edgeType = $("#edgetype")[0].value + "_edge";
	if (edgeWeights[edgeType] != undefined)
		return;
	edgeWeights[edgeType] = [];
	for (var i = 0; i < activityNum; i++)
		for (var j = 0; j < activityNum; j++)
			edgeWeights[edgeType].push(graph[edgeType][i][j]);
	for (var i = 1; i < activityNum * activityNum; i++)
		for (var j = 0; j < activityNum * activityNum - i; j++)
			if (edgeWeights[edgeType][j] > edgeWeights[edgeType][j + 1])
			{
				var t = edgeWeights[edgeType][j];
				edgeWeights[edgeType][j] = edgeWeights[edgeType][j + 1];
				edgeWeights[edgeType][j + 1] = t;
			}
}

function setThreshold()
{
	threshold = (activityNum * activityNum - 1) * $("#threshold")[0].value / 100;
	threshold = edgeWeights[edgeType][parseInt(threshold, 10)];
	$("#threshold-value").text($("#threshold")[0].value + "%");
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
			edgeWeights = {};
			subGraph = {};
			topoLayout = {};
			layout = {};
			pathLayout = {};
			$("#main").height($(window).height() - 20);
			svgWidth = $("#svg").width();
			svgHeight = $("#svg").height();
			setEdgeType();
			setThreshold();
			calcTopoLayout();
			calcLayout();
			paint();
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
			});
			$("#threshold").change(function() {
				setThreshold();
				calcTopoLayout();
				calcLayout();
				repaint();
			});
	});

}

$(document).ready(init);
