const performanceColors = {
    hot:"#d94801",
    normal:"#999",
    cold:"#3182bd"
}

export function drawVisualization4(data,id,xMetric,yMetric,contextMetric,showTrendline,selectedGames,onSelectPair){
    const clean_data = data
    .filter(d => Number.isFinite(d[xMetric]) && Number.isFinite(d[yMetric]) && d.next_pts !== "")
    .sort((a,b) => a.game_index - b.game_index)

    if(clean_data.length === 0) {
        showNoData(id,"No game pairs match these context or metric settings.")
        return
    }

    const facets = createFacets(clean_data,contextMetric)
    const canvas = createCanvas(facets.length)

    clearCanvas(id)

    const svg = addSvg(id,canvas)
    const scales = addScales(clean_data,canvas,facets.length,xMetric,yMetric)

    addTitle(svg,canvas,xMetric,yMetric,contextMetric)
    addFacets(svg,facets,scales,canvas,xMetric,yMetric,contextMetric,showTrendline,selectedGames,onSelectPair)
    addLegends(svg,canvas)
}

function createCanvas(numFacets){
    return{
        width : 800, height: 150 + numFacets * 200, margin:{top: 90,right:140, bottom:60, left:85}
    }
}

function clearCanvas(id){
    d3.select(id).html("")
}

function showNoData(id,message){
    d3.select(id).html(`<p class="empty-message">${message}</p>`)
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function createFacets(data,contextMetric){
    const order = contextOrder(contextMetric)
    const values = [...new Set(data.map(d => d[contextMetric]))]
    .filter(d => d !== "" && d !== undefined)
    .sort((a,b) => order.indexOf(a) - order.indexOf(b))

    return values.map(value => ({
        value:value,
        data:data.filter(d => d[contextMetric] === value)
    }))
}

function contextOrder(contextMetric){
    if(contextMetric === "home_away") return ["home","away"]
    if(contextMetric === "wl") return ["W","L"]
    if(contextMetric === "result_streak_type") return ["W","L"]
    if(contextMetric === "plus_minus_group") return ["strong_negative","negative","neutral","positive","strong_positive"]
    return []
}

function addScales(data,canvas,numFacets,xMetric,yMetric){
    const innerWidth = canvas.width - canvas.margin.left - canvas.margin.right
    const facetHeight = 140
    const gap = 60

    const xExtent = paddedExtent(data,d => d[xMetric])
    const yExtent = paddedExtent(data,d => d[yMetric])

    const xScale = d3.scaleLinear()
    .domain(xExtent)
    .nice()
    .range([canvas.margin.left,canvas.margin.left + innerWidth])

    const yScale = d3.scaleLinear()
    .domain(yExtent)
    .nice()
    .range([facetHeight,0])

    const facetScale = d3.scaleLinear()
    .domain([0,numFacets - 1])
    .range([canvas.margin.top,canvas.margin.top + (numFacets - 1) * (facetHeight + gap)])

    return {xScale,yScale,facetScale,facetHeight,gap}
}

function paddedExtent(data,accessor){
    const extent = d3.extent(data,accessor)
    if(extent[0] === extent[1]){
        return [extent[0] - 1,extent[1] + 1]
    }

    const pad = (extent[1] - extent[0]) * 0.1
    return [extent[0] - pad,extent[1] + pad]
}

function addTitle(svg,canvas,xMetric,yMetric,contextMetric){
    svg.append("text").attr("x",canvas.margin.left).attr("y",25)
    .attr("font-size","9px").attr("font-weight","bold")
    .text("Context Impact View")

    svg.append("text").attr("x",canvas.margin.left).attr("y",45)
    .attr("font-size","8px")
    .text(`Context: ${metricName(contextMetric)} | X: ${metricName(xMetric)} | Y: ${metricName(yMetric)}`)
}

function addFacets(svg,facets,scales,canvas,xMetric,yMetric,contextMetric,showTrendline,selectedGames,onSelectPair){
    const tooltip = toolTip4()

    facets.forEach((facet,i) => {
        const top = scales.facetScale(i)
        const group = svg.append("g").attr("transform",`translate(0,${top})`)

        addAxes(group,scales,canvas,xMetric,yMetric,facet.value,contextMetric)
        addReferenceLines(group,scales,canvas)
        addPoints(group,facet.data,scales,xMetric,yMetric,tooltip,selectedGames,onSelectPair)

        if(showTrendline){
            addTrendline(group,facet.data,scales,xMetric,yMetric)
        }
    })
}

function addAxes(group,scales,canvas,xMetric,yMetric,facetValue,contextMetric){
    const xAxisY = scales.facetHeight

    group.append("g").attr("transform",`translate(0,${xAxisY})`)
    .call(d3.axisBottom(scales.xScale).ticks(6))

    group.append("g").attr("transform",`translate(${canvas.margin.left},0)`)
    .call(d3.axisLeft(scales.yScale).ticks(5))

    group.append("text").attr("x",canvas.margin.left).attr("y",-24)
    .attr("font-size","8px").attr("font-weight","bold")
    .text(`${metricName(contextMetric)}: ${contextLabel(facetValue)}`)

    group.append("text").attr("class","label")
    .attr("x",canvas.width - canvas.margin.right).attr("y",scales.facetHeight + 35)
    .attr("text-anchor","middle").attr("font-size","6px")
    .text(metricName(xMetric))

    group.append("text").attr("class","label")
    .attr("transform","rotate(-90)")
    .attr("x",-(scales.facetHeight / 2)).attr("y",canvas.margin.left - 55)
    .attr("text-anchor","middle").attr("font-size","6px")
    .text(metricName(yMetric))
}

function addReferenceLines(group,scales,canvas){
    const xDomain = scales.xScale.domain()
    const yDomain = scales.yScale.domain()

    if(xDomain[0] <= 0 && xDomain[1] >= 0){
        group.append("line")
        .attr("x1",scales.xScale(0)).attr("x2",scales.xScale(0))
        .attr("y1",0).attr("y2",scales.facetHeight)
        .attr("stroke","#777").attr("stroke-dasharray","5 3")
    }

    if(yDomain[0] <= 0 && yDomain[1] >= 0){
        group.append("line")
        .attr("x1",canvas.margin.left).attr("x2",canvas.width - canvas.margin.right)
        .attr("y1",scales.yScale(0)).attr("y2",scales.yScale(0))
        .attr("stroke","#777").attr("stroke-dasharray","5 3")

        group.append("text").attr("x",canvas.width - canvas.margin.right + 8)
        .attr("y",scales.yScale(0) + 2).attr("font-size","5px")
        .text("neutral")
    }
}

function addPoints(group,data,scales,xMetric,yMetric,tooltip,selectedGames,onSelectPair){
    const outlierCutoff = outlierThreshold(data,yMetric)

    group.selectAll(".context-point").data(data).enter()
    .append("circle").attr("class","context-point")
    .attr("cx",d => scales.xScale(d[xMetric]))
    .attr("cy",d => scales.yScale(d[yMetric]))
    .attr("r",d => pointRadius(d,yMetric,outlierCutoff,selectedGames))
    .attr("fill",d => performanceColors[d.performance_label])
    .attr("stroke",d => isSelectedPoint(selectedGames,d) || Math.abs(d[yMetric]) >= outlierCutoff ? "#000" : "none")
    .attr("stroke-width",d => isSelectedPoint(selectedGames,d) ? 1.5 : 0.8)
    .attr("opacity",d => hasSelection(selectedGames) && !isSelectedPoint(selectedGames,d) ? 0.35 : 0.8)
    .attr("cursor","pointer")
    .on("mouseover",function(event,d){
        d3.select(this).attr("r",5)
        tooltip.style("opacity",1).html(tooltipInformations4(d,xMetric,yMetric))
    })
    .on("mousemove",function(event){
        tooltip.style("left",event.clientX+15+"px")
        .style("top",event.clientY-20+"px")
    })
    .on("mouseout",function(event,d){
        d3.select(this).attr("r",pointRadius(d,yMetric,outlierCutoff,selectedGames))
        tooltip.style("opacity",0)
    })
    .on("click",function(event,d){
        if(onSelectPair) onSelectPair(d)
    })
}

function pointRadius(d,metric,outlierCutoff,selectedGames){
    if(isSelectedPoint(selectedGames,d)) return 5
    return Math.abs(d[metric]) >= outlierCutoff ? 4 : 2.5
}

function hasSelection(selectedGames){
    return selectedGames && selectedGames.indexes && selectedGames.indexes.length > 0
}

function isSelectedPoint(selectedGames,d){
    if(!hasSelection(selectedGames)) return false
    if(selectedGames.pairStart !== null) return selectedGames.pairStart === d.game_index
    return selectedGames.indexes.includes(d.game_index)
}

function outlierThreshold(data,metric){
    const values = data.map(d => Math.abs(d[metric])).sort((a,b) => a - b)
    const index = Math.floor(values.length * 0.9)
    return values[index] || Infinity
}

function addTrendline(group,data,scales,xMetric,yMetric){
    if(data.length < 2) return

    const line = regressionLine(data,xMetric,yMetric)
    if(line === null) return

    const xDomain = scales.xScale.domain()

    group.append("line")
    .attr("x1",scales.xScale(xDomain[0]))
    .attr("x2",scales.xScale(xDomain[1]))
    .attr("y1",scales.yScale(line.slope * xDomain[0] + line.intercept))
    .attr("y2",scales.yScale(line.slope * xDomain[1] + line.intercept))
    .attr("stroke","#552503")
    .attr("stroke-width",1)
}

function regressionLine(data,xMetric,yMetric){
    const n = data.length
    const sumX = d3.sum(data,d => d[xMetric])
    const sumY = d3.sum(data,d => d[yMetric])
    const sumXY = d3.sum(data,d => d[xMetric] * d[yMetric])
    const sumXX = d3.sum(data,d => d[xMetric] * d[xMetric])
    const denominator = n * sumXX - sumX * sumX

    if(denominator === 0) return null

    const slope = (n * sumXY - sumX * sumY) / denominator
    const intercept = (sumY - slope * sumX) / n

    return {slope,intercept}
}

function addLegends(svg,canvas){
    const legendData = [
        {label:"Hot game",value:"hot"},
        {label:"Normal game",value:"normal"},
        {label:"Cold game",value:"cold"}
    ]

    const lg = svg.append("g").attr("transform",`translate(${canvas.width - 115},${canvas.margin.top})`)

    lg.selectAll(".context-legend-dot").data(legendData).enter()
    .append("circle").attr("cx",0).attr("cy",(d,i) => i * 14)
    .attr("r",3).attr("fill",d => performanceColors[d.value])

    lg.selectAll(".context-legend-text").data(legendData).enter()
    .append("text").attr("x",8).attr("y",(d,i) => i * 14 + 2)
    .attr("font-size","6px").text(d => d.label)

    lg.append("line").attr("x1",0).attr("x2",20).attr("y1",50).attr("y2",50)
    .attr("stroke","#552503").attr("stroke-width",1)
    lg.append("text").attr("x",24).attr("y",52).attr("font-size","6px").text("Trendline")
}

function toolTip4(){
    let tooltip = d3.select("body").select(".tooltip4")
    if(tooltip.empty()){
        tooltip = d3.select("body").append("div").attr("class","tooltip tooltip4")
    }

    return tooltip
}

function tooltipInformations4(data,xMetric,yMetric){
    return `<strong>Game ${data.game_index} → ${data.game_index + 1}</strong><br>
            Date : ${data.game_date}<br>
            Opponent : ${data.opponent}<br>
            Home/Away : ${data.home_away}<br>
            Result : ${data.wl}<br>
            Team streak : ${data.result_streak_type}${data.result_streak_length}<br>
            Performance : ${data.performance_label}<br>
            ${metricName(xMetric)} : ${data[xMetric]}<br>
            ${metricName(yMetric)} : ${data[yMetric]}<br>
            Points : ${data.pts} → ${data.next_pts}<br>
            FGA : ${data.fga} → ${data.next_fga}`
}

function metricName(metric){
    if(metric === "pts_diff_from_baseline") return "PTS Difference from Baseline"
    if(metric === "plus_minus") return "Plus/Minus"
    if(metric === "next_pts_diff_from_baseline") return "Next PTS Difference from Baseline"
    if(metric === "next_fga_change") return "Next FGA Change"
    if(metric === "home_away") return "Home/Away"
    if(metric === "wl") return "Win/Loss"
    if(metric === "plus_minus_group") return "Plus/Minus Group"
    if(metric === "result_streak_type") return "Team Streak Type"
    return metric
}

function contextLabel(value){
    if(value === "home") return "Home"
    if(value === "away") return "Away"
    if(value === "W") return "Win"
    if(value === "L") return "Loss"
    if(value === "strong_positive") return "Strong Positive"
    if(value === "positive") return "Positive"
    if(value === "neutral") return "Neutral"
    if(value === "negative") return "Negative"
    if(value === "strong_negative") return "Strong Negative"
    return value
}
