export function drawVisualization1(data,id,metric){

     const canvas = createCanvas()
     
     const svg = addSvg(id,canvas)
     const sc = addScales(data,canvas,metric)

     addAxes(svg,sc,canvas)
     addPointsLine(svg,sc,data)
     addAverageLine(svg,sc,data)
     addBaselineLine(svg,sc,data)
}

function createCanvas(){
    return{
        width : 500, height: 200, margin:{top: 20, bottom:60,right:40, left:50}
    }
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function addScales(data,canvas,metric){
    const xScale = 
    d3.scaleLinear().domain(d3.extent(data,dt => dt.game_index))
    .range([canvas.margin.left,canvas.width - canvas.margin.right])

    const yScale = 
      d3.scaleLinear().domain([0,d3.max(data,d => d[metric])])
      .range([canvas.height - canvas.margin.bottom,canvas.margin.top])

    return {xScale,yScale} 
}

function addAxes(svg, scales, canvas){
    svg.append("g").attr("transform",`translate(0, ${canvas.height - canvas.margin.bottom})`)
    .call(d3.axisBottom(scales.xScale))

    svg.append("g").attr("transform",`translate(${canvas.margin.left},0)`)
    .call(d3.axisLeft(scales.yScale))
}

function addPointsLine(svg,scales,data){
    let line = d3.line().x(d => scales.xScale(d.game_index)).y(d => scales.yScale(d.pts))

    svg.append("path").datum(data).attr("fill","none").attr("stroke","#222")
     .attr("stroke-width",1).attr("d",line)
}

function addAverageLine(svg,scales,data){
    let avg_line = d3.line().x(d => scales.xScale(d.game_index)).y(d => scales.yScale(d.rolling_pts_avg_3))

    svg.append("path").datum(data).attr("fill","none").attr("stroke","#fdb927")
     .attr("stroke-width",1).attr("d",avg_line)
}

function addBaselineLine(svg,scales,data){
    let base_line = data[0].baseline_pts

    svg.append("line")
    .attr("x1",scales.xScale(d3.min(data,dt => dt.game_index))).attr("x2",scales.xScale(d3.max(data,dt => dt.game_index)))
    .attr("y1",scales.yScale(base_line)).attr("y2",scales.yScale(base_line))
    .attr("stroke","#777").attr("stroke-dasharray","6 4")
}