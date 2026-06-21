
const colors_labels = [
    {lab:"Hot games",color:"#d73027"},
    {lab:"Normal games",color:"#fff"},
    {lab:"Cold games",color:"#4575b4"}
]
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

     addCells(svg,baseline_classif.classification,canvas,scale)

     addLegends(svg,canvas)
     
}

function createCanvas(){
    return{
        width : 800, height: 200, margin:{top: 20,right:100, bottom:60, left:50}
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
    return color_sc
}

function addTitle(svg,canvas,baseline,metric){
    svg.append("text").attr("x",canvas.margin.left).attr("y",25).attr("font-size","9px")
    .attr("font-weight","bold").text("Hot/Cold Streak Explorer")

    svg.append("text").attr("x",canvas.margin.left).attr("y",45).attr("font-size","9px")
    .text(`Metric: ${metric} | Baseline: ${baseline.toFixed(2)}`)
}

function addLablels(svg, classification,canvas){
    const num = 30
    svg.selectAll(".game-label").data(classification).enter().append("text").attr("class","game-label")
    .attr("x",(d,j) => canvas.margin.left + (j%num) * 18 + 10 /2).attr("y",(d,j) => 75 + (Math.floor(j/num))*40)
    .attr("text-anchor","middle").attr("font-size","6px").text(d => `G${d.g_num}`)
}

function addCells(svg, classification,canvas,scale){
    const num = 30
    svg.selectAll(".game-cell").data(classification).enter().append("rect").attr("class","game-cell")
    .attr("x",(d,j) => canvas.margin.left + (j%num) * 18).attr("y",(d,j) => 85 + (Math.floor(j/num))*40).attr("width",5).attr("height",5)
    .attr("fill",d => scale(d.perf_label)).attr("stroke","#222").attr("stroke-width",0.5)
}

function addLegends(svg,canvas){
    svg.selectAll(".legend-rec").data(colors_labels).enter().append("rect").attr("class",".legend-rec")
    .attr("x",canvas.width - 100).attr("y",(d,j) => 75 + j * 25)
    .attr("width",5).attr("height",5).attr("fill",d => d.color).attr("stroke","#222")

    svg.selectAll(".legend-tex").data(colors_labels).enter().append("text").attr("class",".legend-tex")
    .attr("x",canvas.width - 125).attr("y",(d,j) => 75 + j * 25).attr("font-size","8px").text(d => d.lab)
}