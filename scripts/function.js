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

function init()
{
	d3.json("data/graphNet.json", function (error, data) {
			graph = data;
			activityNum = graph["activity_name"].length;
			subGraph = {};
			edgeType = "total_duration_edge";
			threshold = 0;
			sugiyama();
			});
}
