export function drawVisualization1(data,id,metric){
     if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)
     const sc = addScales(data,canvas,metric)

     addAxes(svg,sc,canvas)
     addMetricLine(svg,sc,data,metric)
     addAverageLine(svg,sc,data,metric)
     addBaselineLine(svg,sc,data,metric)
     addPoints(svg,sc,data,metric)
     addLabels(svg,canvas,metric)
     
     addLegends(svg,canvas)
}

function createCanvas(){
    return{
        width : 600, height: 200, margin:{top: 20,right:100, bottom:60, left:50}
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
      .nice().range([canvas.height - canvas.margin.bottom,canvas.margin.top])

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
     .attr("stroke-width",0.8).attr("d",line)
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
    const tooltip = toolTip()

    svg.selectAll("circle").data(data).enter()
     .append("circle").attr("class","game-pt")
     .attr("cx", d => scales.xScale(d.game_index))
     .attr("cy",d => scales.yScale(d[metric]))
     .attr("r",2).attr("fill",d => colorPoint(d.performance_label))
     .on("mouseover",function(event,d){
        d3.select(this).attr("r",3).attr("stroke","black").attr("stroke-width",2)
        tooltip.style("opacity",1).html(tooltipInformations(d))
     })

     
}

function colorPoint(perf){
    if(perf === "hot") return "#d94801"
    if(perf === "cold") return "#3182bd"
    return "#999"
}

function addLabels(svg,canvas,metric){
    svg.append("text").attr("class","label")
    .attr("x",canvas.width - 100).attr("y",canvas.height-40)
    .attr("text-anchor","middle").attr("font-size","5px")
    .text("Game Order")

    svg.append("text").attr("class","label")
    .attr("x",40).attr("y",10)
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

function addLegends(svg,canvas){
    const lg = svg.append("g").attr("transform",
        `translate(${canvas.width - canvas.margin.right+20},${canvas.margin.top-10})`)


    lg.append("circle").attr("cx",0).attr("cy",0).attr("r",2).attr("fill","#d94801")
    lg.append("text").attr("x",5).attr("y",2).text("Hot game").attr("font-size","5px")

    lg.append("circle").attr("cx",0).attr("cy",10).attr("r",2).attr("fill","#999")
    lg.append("text").attr("x",5).attr("y",12).text("Normal game").attr("font-size","5px")

    lg.append("circle").attr("cx",0).attr("cy",20).attr("r",2).attr("fill","#3182bd")
    lg.append("text").attr("x",5).attr("y",22).text("Cold game").attr("font-size","5px")


    lg.append("line").attr("x1",0).attr("x2",20).attr("y1",30).attr("y2",30)
    .attr("stroke","black").attr("stroke-width",2)
    lg.append("text").attr("x",21).attr("y",30).text(" = Metric").attr("font-size","5px")

    lg.append("line").attr("x1",0).attr("x2",20).attr("y1",40).attr("y2",40)
    .attr("stroke","black").attr("stroke-dasharray","6 4")
    lg.append("text").attr("x",21).attr("y",40).text(" = Baseline").attr("font-size","5px")

    lg.append("line").attr("x1",0).attr("x2",20).attr("y1",50).attr("y2",50)
    .attr("stroke-width",2).attr("stroke","#fdb927")
    lg.append("text").attr("x",21).attr("y",50).text(" = Rolling Average").attr("font-size","5px")
}

function toolTip(){
    let tooltip = d3.select("body").select(".tooltip")
    if(tooltip.empty()){
        tooltip = d3.select("body").append("div").attr("class","tooltip")
    }

    return tooltip
}

function tooltipInformations(data){
    return `<strong> Game ${data.game_index} </strong><br>
            Date : ${data.game_date}<br>
            Home/Away : ${data.home_away}<br>
            Points : ${data.pts}<br>
            Minutes : ${data.min}<br>
            FGA : ${data.fga}<br>
            Next Game Points : ${data.next_pts}<br>`
}