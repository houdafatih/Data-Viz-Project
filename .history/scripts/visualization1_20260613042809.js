export function drawVisualization1(data,id,metric){
     if(data.length === 0) return
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)
     const sc = addScales(data,canvas,metric)

     addAxes(svg,sc,canvas)
     /*addMetricLine(svg,sc,data,metric)
     addAverageLine(svg,sc,data,metric)
     addBaselineLine(svg,sc,data,metric)
     addPoints(svg,sc,data,metric)*/
     addLabels(svg,canvas,metric)
}

function createCanvas(){
    return{
        width : 500, height: 200, margin:{top: 20,right:40, bottom:60, left:50}
    }
}

function clearCanvas(id){
    d3.select(id).html("")
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function addScales(data,canvas,metric){
    const xScale = 
    d3.scaleLinear().domain(d3.extent(data,dt => dt.game_index))
    .range([canvas.margin.left,canvas.width - canvas.margin.right])

    const yScale = 
      d3.scaleLinear().domain([d3.min(data,d => d[metric]),d3.max(data,d => d[metric])])
      .range([canvas.height - canvas.margin.bottom,canvas.margin.top])

    return {xScale,yScale} 
}

function addAxes(svg, scales, canvas){
    svg.append("g").attr("transform",`translate(0, ${canvas.height - canvas.margin.bottom})`)
    .call(d3.axisBottom(scales.xScale))

    svg.append("g").attr("transform",`translate(${canvas.margin.left},0)`)
    .call(d3.axisLeft(scales.yScale))
}

function addMetricLine(svg,scales,data,metric){
    let line = d3.line().x(d => scales.xScale(d.game_index)).y(d => scales.yScale(d[metric]))

    svg.append("path").datum(data).attr("fill","none").attr("stroke","#222")
     .attr("stroke-width",0.5).attr("d",line)
}

function addAverageLine(svg,scales,data,metric){
    if(metric != "pts") return
    let avg_line = d3.line().x(d => scales.xScale(d.game_index)).y(d => scales.yScale(d.rolling_pts_avg_3))

    svg.append("path").datum(data).attr("fill","none").attr("stroke","#fdb927")
     .attr("stroke-width",0.5).attr("d",avg_line)
}

function addBaselineLine(svg,scales,data,metric){

    let base_line = d3.mean(data,d => d[metric])
    

    svg.append("line")
    .attr("x1",scales.xScale(d3.min(data,dt => dt.game_index))).attr("x2",scales.xScale(d3.max(data,dt => dt.game_index)))
    .attr("y1",scales.yScale(base_line)).attr("y2",scales.yScale(base_line))
    .attr("stroke","#777").attr("stroke-dasharray","6 4")
}

function addPoints(svg,scales,data,metric){
    svg.selectAll("circle").data(data).enter()
     .append("circle").attr("class","game-pt")
     .attr("cx", d => scales.xScale(d.game_index))
     .attr("cy",d => scales.yScale(d[metric]))
     .attr("r",2).attr("fill",d => colorPoint(d.performance_label))
}

function colorPoint(perf){
    if(perf === "hot") return "#d94801"
    if(perf === "cold") return "#3182bd"
    return "#999"
}

function addLabels(svg,canvas,metric){
    svg.append("text").attr("class","x-label")
    .attr("x",canvas.width - 20).attr("y",canvas.height-40)
    .attr("text-anchor","middle").attr("font-size","5px")
    .text("Game Order")

    svg.append("text").attr("class","y-label")
    .attr("x",canvas.width).attr("y",-canvas.height)
    .attr("text-anchor","middle").attr("font-size","5px")
    .text(metricName(metric))
}

function metricName(metric){
    if(metric === "pts") return "Points"
    if(metric === "fga") return "Field Goal Attempts"
    if(metric === "min") return "Minutes"
    if(metric === "fg_pct") return "Field Goal Percentage"
    if(metric === "plus_minus") return "Plus / Minus"
}