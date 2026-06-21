export function drawVisualization3(data,id,metric,threshold){
     if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)

     const baseline_classif = calculateBaselineAndClassifyGames(data,metric)
     const scale = colorScale()

     addTitle(svg,canvas,baseline_classif.baseline,metric)

     addLablels(svg,baseline_classif.classification,canvas)

     addCells(scale,baseline_classif.classification,canvas,scale)


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

function calculateBaselineAndClassifyGames(data,metric)
{
  const baseline = d3.mean(data,dt=> dt[metric])

  const classification = data.map((d,j)=> {
    let perf_label = ""
    if(d[metric] > baseline + 5){
        perf_label = "hot"
    }else if(d[metric] < baseline - 5){
        perf_label = "cold"
    }
    else perf_label = "normal"

    return {
        ...d,
        g_num : j+1,
        perf_label:perf_label,
        difference : d[metric] - baseline
    }
  })

    return{
        baseline : baseline,
        classification : classification
    }
}

function colorScale(){
    const color_sc = d3.scaleOrdinal()
    .domain(["hot","normal","cold"])
    .range(["#d73027","#fff","#4575b4"])
}

function addTitle(svg,canvas,baseline,metric){
    svg.append("text").attr("x",canvas.margin.left).attr("y",25).attr("font-size","9px")
    .attr("font-weight","bold").text("Hot/Cold Streak Explorer")

    svg.append("text").attr("x",canvas.margin.left).attr("y",45).attr("font-size","9px")
    .text(`Metric: ${metric} | Baseline: ${baseline.toFixed(2)}`)
}

function addLablels(svg, classification,canvas){
    svg.selectAll(".game-label").data(classification).enter().append("text").attr("class","game-label")
    .attr("x",(d,j) => canvas.margin.left + j * 20 + 15 /2).attr("y",75).attr("text-anchor","middle")
    .attr("font-size","6px").text(d => `G${d.g_num}`)
}

function addCells(svg, classification,canvas,scale){
    svg.selectAll(".game-cell").data(classification).enter().append("rect").attr("class","game-cell")
    .attr("x",(d,j) => canvas.margin.left + j * 20).attr("y",85).attr("width",15).attr("height",15)
    .attr("fill",d => scale(d.perf_label)).attr("stroke","#222").attr("stroke-width",1)
}