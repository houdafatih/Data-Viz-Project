export function drawVisualization2(data,id,metric,eventT){
    if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)
     
     const new_data = createData(data,metric)

     const scale = d3.scaleLinear().domain(d3.extent(new_data.flatMap(d => [d.current_v,d.next_v]))).range([4,8])

     draw_Header(svg,200,400)
     draw_Rows(svg,new_data,200,400,canvas.margin,55,scale)
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

function createData(data,metric){
   const new_data = data.slice().sort((a,b) => a.game_index - b.game_index)

   return new_data.slice(0,-1).map((d,j) => {
      const nextG = new_data[j+1]

      return {
        eventN: String.fromCharCode(65+j),
        game_idx : d.game_index,
        nextg_index : nextG.game_idx,
        current_v: d[metric],
        next_v : nextG[metric],
        difference : nextG[metric] - d[metric],
        current_g : d,
        next_g : nextG
      }
   })
}

function draw_Header(svg,left,right){
    svg.append("text").attr("x",left).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","8px").text("Game n")

    svg.append("text").attr("x",right).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","8px").text("Game n+1")

}

function draw_Rows(svg,new_data,left,right,margin,r_height,scale){

    const rows = svg.selectAll(".response-row").data(new_data).enter()
     .append("g").attr("class","response-row")
     .attr("transform",(d,j) => `translate(0,${margin.top+j*r_height})`)

    rows.append("text").attr("x",30).attr("y",5).text(d => d.eventN)
    rows.append("text").attr("x",left-30).attr("y",5).attr("text-anchor","end").text(d => d.current_v)

    rows.append("Line").attr("x1",left).attr("x2",right)
    .attr("y1",0).attr("y2",0).attr("stroke","black").attr("stroke-dasharray","5 3")
    .attr("stroke-width",1.5)

    rows.append("circle").attr("cx",left).attr("cy",0).attr("r" ,d=>scale(d.current_v)).attr("fill","black")
    rows.append("circle").attr("cx",right).attr("cy",0).attr("r" ,d=>scale(d.next_v)).attr("fill","black")

    
}

function metricName(metric){
    if(metric === "pts") return "Points"
    if(metric === "fga") return "Field Goal Attempts"
    if(metric === "min") return "Minutes"
    if(metric === "fg_pct") return "Field Goal Percentage"
    if(metric === "plus_minus") return "Plus / Minus"
}