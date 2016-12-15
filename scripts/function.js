function sugiyama()
{
	if (subGraph[edgeType] != undefined)
		return;
	subGraph[edgeType] = [];
	for (var i = 0; i < activityNum; i++)
	{
		subGraph[edgeType].push([]);
		for (var j = 0; j < activityNum; j++)
			subGraph[edgeType][i].push(0);
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
					if (v[j] && graph[edgeType][i][j] > threshold)
					{
						b = false;
						break;
					}
				if (!b)
				{
					b = true;
					for (var j = 0; j < activityNum; j++)
						if (v[j] && graph[edgeType][j][i] > threshold)
						{
							b = false;
							break;
						}
				}
				if (b)
				{
					for (var j = 0; j < activityNum; j++)
					{
						subGraph[edgeType][i][j] = graph[edgeType][i][j];
						subGraph[edgeType][j][i] = graph[edgeType][j][i];
						graph[edgeType][i][j] = 0;
						graph[edgeType][j][i] = 0;
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
				{
					if (v[j])
					{
						if (graph[edgeType][j][i] > threshold)
							inNum++;
						if (graph[edgeType][i][j] > threshold)
							outNum++;
					}
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
					subGraph[edgeType][j][ti] = graph[edgeType][j][ti];
				else
					subGraph[edgeType][ti][j] = graph[edgeType][ti][j];
				graph[edgeType][j][ti] = 0;
				graph[edgeType][ti][j] = 0;
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
	for (var i = 0; i < activityNum; i++)
		topoLayout.push({"level": 0, "order": i});
	orderNum.push(activityNum);
	levelNum = 1;
	maxOrder = activityNum;
}

function paint()
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
		layout.push({"x": spaceWidth * (topoLayout[i]["order"] + 1) + rectWidth * topoLayout[i]["order"], "y": spaceHeight * (topoLayout[i]["level"] + 1) + rectHeight * topoLayout[i]["level"]});

	}
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
		.text(function(d, i) { return graph["activity_name"][i]; });
}

function init()
{
	svgWidth = document.documentElement.clientWidth - 100;
	svgHeight = document.documentElement.clientHeight - 100;
	svg = d3.select("body").append("svg").attr("width", svgWidth).attr("height", svgHeight);
	d3.json("data/graphNet.json", function (error, data) {
			graph = data;
			activityNum = graph["activity_name"].length;
			subGraph = {};
			edgeType = "total_duration_edge";
			threshold = 0;
			sugiyama();
			topoSort();
			paint();
			});
}

init();
